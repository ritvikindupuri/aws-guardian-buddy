
CREATE OR REPLACE FUNCTION public.handle_new_user_org()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id UUID;
  user_email TEXT;
BEGIN
  user_email := NEW.email;
  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (
    COALESCE(split_part(user_email, '@', 1), 'My Organization'),
    gen_random_uuid()::text,
    NEW.id
  )
  RETURNING id INTO new_org_id;

  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');

  -- Auto-assign free tier subscription
  INSERT INTO public.subscriptions (user_id, org_id, stripe_customer_id, plan_name, status, seats)
  VALUES (NEW.id, new_org_id, 'free_' || NEW.id::text, 'free', 'active', 1);

  RETURN NEW;
END;
$function$;
