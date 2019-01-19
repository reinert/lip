-- ######################################################################### --
-- EXTENSIONS
-- ######################################################################### --

CREATE EXTENSION pg_trgm;
CREATE EXTENSION unaccent;
CREATE EXTENSION citext;

CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS citext AS
$func$
  SELECT unaccent('unaccent', $1)::citext
$func$  LANGUAGE sql IMMUTABLE SET search_path = public, pg_temp;


-- ######################################################################### --
-- MODULE financial
-- ######################################################################### --

CREATE SCHEMA financial;

CREATE TYPE financial.kind AS ENUM ('REVENUE', 'EXPENSE');

CREATE TABLE financial.category
(
  id smallserial,
  kind financial.kind NOT NULL,
  parent_id smallint,
  name citext NOT NULL,
  analytical boolean NOT NULL DEFAULT FALSE,
  inactive boolean NOT NULL DEFAULT FALSE,
  CONSTRAINT cetegory_pk PRIMARY KEY (id),
  CONSTRAINT category_uq UNIQUE (id, kind),
  CONSTRAINT category_parent_fk FOREIGN KEY (parent_id)
      REFERENCES financial.category (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX category_kind_idx ON financial.category (kind);



CREATE TABLE financial.transaction
(
  id bigserial,
  kind financial.kind NOT NULL,
  category_id smallint NOT NULL,
  description citext NOT NULL,
  billing_month date NOT NULL,
  details citext,
  
  due_date date NOT NULL,
  due_amount numeric(11,2) NOT NULL,

  done_date date,
  done_additions numeric(11,2),
  done_discounts numeric(11,2),
  done_amount numeric(11,2),

  CONSTRAINT transaction_pk PRIMARY KEY (id),

  CONSTRAINT transaction_category_fk FOREIGN KEY (category_id, kind)
      REFERENCES financial.category (id, kind) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX transaction_kind_idx ON financial.transaction (kind);
CREATE INDEX transaction_due_date_idx ON financial.transaction (due_date);

CREATE OR REPLACE FUNCTION financial.transaction_calc_done_amount() RETURNS trigger AS $transaction_calc_done_amount$
BEGIN
  IF NEW.done_date IS NOT NULL AND NEW.done_amount IS NULL THEN
    NEW.done_amount = NEW.due_amount + coalesce(NEW.done_additions, 0) - coalesce(NEW.done_discounts, 0);
  ELSE
    NEW.done_amount = null;
  END IF;
  RETURN NEW;
END;
$transaction_calc_done_amount$ LANGUAGE plpgsql;

CREATE TRIGGER financial_transaction_calc_done_amount_tg BEFORE INSERT OR UPDATE ON financial.transaction
FOR EACH ROW EXECUTE PROCEDURE financial.transaction_calc_done_amount();
