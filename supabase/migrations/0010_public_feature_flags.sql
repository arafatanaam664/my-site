-- Only flags that affect a ready public surface may be made visible to the public gate.
update public.feature_flags set public_visible = true where flag = 'social_sharing';
