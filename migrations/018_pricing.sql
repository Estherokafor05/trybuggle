-- Prices and payments for learners (one course, all-access) and monthly or
-- yearly organisation plans, plus offers and discount codes. All prices are in
-- US dollar cents; Stripe shows them in the payer's own currency at checkout.
-- Everything starts switched off until an admin sets a price.
-- Additive and safe to run more than once.

CREATE TABLE IF NOT EXISTS learner_prices (
  code text PRIMARY KEY CHECK (code IN ('course', 'all_month', 'all_year')),
  amount integer NOT NULL DEFAULT 0 CHECK (amount >= 0 AND amount <= 10000000),
  currency text NOT NULL DEFAULT 'usd' CHECK (currency ~ '^[a-z]{3}$'),
  active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO learner_prices(code) VALUES ('course'), ('all_month'), ('all_year') ON CONFLICT DO NOTHING;

ALTER TABLE org_plans ADD COLUMN IF NOT EXISTS price_per_seat_month integer NOT NULL DEFAULT 0;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS billing_interval text NOT NULL DEFAULT 'year';

-- The launch offer and any sale. One row.
CREATE TABLE IF NOT EXISTS offers (
  id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  -- Off a person's (or organisation's) first purchase.
  launch_on boolean NOT NULL DEFAULT true,
  launch_percent smallint NOT NULL DEFAULT 20 CHECK (launch_percent BETWEEN 1 AND 90),
  -- Off everything until sale_ends_at.
  sale_percent smallint NOT NULL DEFAULT 0 CHECK (sale_percent BETWEEN 0 AND 90),
  sale_ends_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO offers(id) VALUES ('main') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS discount_codes (
  code text PRIMARY KEY CHECK (code ~ '^[A-Z0-9-]{3,30}$'),
  percent smallint NOT NULL CHECK (percent BETWEEN 1 AND 100),
  applies_to text NOT NULL DEFAULT 'any' CHECK (applies_to IN ('any', 'course', 'all_access', 'org')),
  expires_at timestamptz,
  max_uses integer CHECK (max_uses IS NULL OR max_uses > 0),
  uses integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Every payment, for receipts, the launch offer (first purchase only) and refunds.
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id text REFERENCES learners(id) ON DELETE SET NULL,
  org_id uuid REFERENCES organisations(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('course', 'all_access', 'org_plan')),
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  course_title text,
  interval text CHECK (interval IS NULL OR interval IN ('month', 'year')),
  amount_paid integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  discount text,
  stripe_session_id text UNIQUE,
  stripe_payment_intent text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  refunded_at timestamptz
);
CREATE INDEX IF NOT EXISTS purchases_learner ON purchases(learner_id);
CREATE INDEX IF NOT EXISTS purchases_org ON purchases(org_id);

-- A learner's Stripe customer, for managing an all-access subscription.
CREATE TABLE IF NOT EXISTS learner_billing (
  learner_id text PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL UNIQUE
);

-- Stripe coupons made for each discount size, so they're made only once.
CREATE TABLE IF NOT EXISTS stripe_coupons (
  percent smallint PRIMARY KEY,
  coupon_id text NOT NULL
);
