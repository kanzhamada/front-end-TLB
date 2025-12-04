create table public."availableDates" (
  "dateID" uuid not null default gen_random_uuid (),
  date date null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint availableDates_pkey primary key ("dateID"),
  constraint availableDates_date_key unique (date)
) TABLESPACE pg_default;

create table public."availableDates" (
  "dateID" uuid not null default gen_random_uuid (),
  date date null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint availableDates_pkey primary key ("dateID"),
  constraint availableDates_date_key unique (date)
) TABLESPACE pg_default;

create table public.barbers (
  "barberID" uuid not null default gen_random_uuid (),
  name text null,
  "phoneNumber" text null,
  description text null,
  skills text null,
  experience text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint barbers_pkey primary key ("barberID")
) TABLESPACE pg_default;

create table public."barbershopExpenses" (
  "barbershopExpensesID" uuid not null default gen_random_uuid (),
  nominal integer null,
  description text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint berbershopExpenses_pkey primary key ("barbershopExpensesID")
) TABLESPACE pg_default;

create table public."catalogueImages" (
  "catalogueImagesID" uuid not null default gen_random_uuid (),
  "catalogueID" uuid null default gen_random_uuid (),
  "imageUrl" text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint catalogueImages_pkey primary key ("catalogueImagesID"),
  constraint catalogueImages_catalogueID_fkey foreign KEY ("catalogueID") references catalogues ("catalogueID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;  

create table public.catalogues (
  "catalogueID" uuid not null default gen_random_uuid (),
  name text null,
  type public.hairtype null,
  description text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint catalogues_pkey primary key ("catalogueID")
) TABLESPACE pg_default;

create table public.chats (
  "chatID" uuid not null default gen_random_uuid (),
  "reservationID" uuid null default auth.uid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint chats_pkey primary key ("chatID"),
  constraint chats_reservationID_fkey foreign KEY ("reservationID") references reservations ("reservationID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create table public.messages (
  "messageID" uuid not null default gen_random_uuid (),
  "chatID" uuid null default gen_random_uuid (),
  sender uuid null default gen_random_uuid (),
  content text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  read boolean null default false,
  constraint messages_pkey primary key ("messageID"),
  constraint messages_chatID_fkey foreign KEY ("chatID") references chats ("chatID") on update CASCADE on delete CASCADE,
  constraint messages_sender_fkey foreign KEY (sender) references profiles ("userID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create table public."offlineServices" (
  "offlineServiceID" uuid not null default gen_random_uuid (),
  "serviceID" uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  "paymentType" public.paymentType null default 'Tunai'::"paymentType",
  constraint offlineServices_pkey primary key ("offlineServiceID"),
  constraint offlineServices_serviceID_fkey foreign KEY ("serviceID") references services ("serviceID") on update RESTRICT on delete RESTRICT
) TABLESPACE pg_default;

create table public.payments (
  "paymentID" uuid not null default gen_random_uuid (),
  "voucherID" uuid null default gen_random_uuid (),
  "reservationID" uuid not null default gen_random_uuid (),
  "downPayment" bigint null,
  "totalPayment" bigint null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  "paymentStatus" public.paymentstatus not null default 'pending'::paymentstatus,
  "fulfillmentStatus" public.fulfillmentStatus not null default 'pendingDownPayment'::"fulfillmentStatus",
  constraint payments_pkey primary key ("paymentID"),
  constraint payments_reservationID_fkey foreign KEY ("reservationID") references reservations ("reservationID") on update CASCADE on delete CASCADE,
  constraint payments_voucherID_fkey foreign KEY ("voucherID") references vouchers ("voucherID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger on_payment_status_change BEFORE
update on payments for EACH row when (
  old."paymentStatus" is distinct from new."paymentStatus"
)
execute FUNCTION trg_update_reservation_on_payment ();

create table public.profiles (
  "userID" uuid not null default auth.uid (),
  "displayName" text null,
  phone text null,
  email text null,
  "photoProfile" text null,
  coin bigint null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint users_pkey primary key ("userID"),
  constraint users_userID_fkey foreign KEY ("userID") references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create table public.redeem_code (
  "reedemCodeID" uuid not null default gen_random_uuid (),
  code text null,
  "voucherID" uuid null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint reedem_code_pkey primary key ("reedemCodeID"),
  constraint reedem_code_voucherID_fkey foreign KEY ("voucherID") references vouchers ("voucherID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create table public."rescheduleReservation" (
  "reservationID" uuid not null,
  "oldDateTimeID" uuid null,
  "newDateTimeID" uuid null,
  status public.rescheduleStatus not null default 'pending'::"rescheduleStatus",
  created_at timestamp with time zone not null default now(),
  constraint rescheduleReservation_pkey primary key ("reservationID"),
  constraint rescheduleReservation_reservationID_fkey foreign KEY ("reservationID") references reservations ("reservationID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create table public.reservations (
  "reservationID" uuid not null default gen_random_uuid (),
  "userID" uuid not null default gen_random_uuid (),
  "serviceID" uuid not null default gen_random_uuid (),
  "barberID" uuid not null default gen_random_uuid (),
  "dateTimeID" uuid not null default gen_random_uuid (),
  status public.reservationStatus not null,
  notes text null,
  invoice text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint reservations_pkey primary key ("reservationID"),
  constraint reservations_barberID_fkey foreign KEY ("barberID") references barbers ("barberID") on update CASCADE on delete CASCADE,
  constraint reservations_dateTimeID_fkey foreign KEY ("dateTimeID") references "availableHours" ("hourID") on update CASCADE on delete CASCADE,
  constraint reservations_serviceID_fkey foreign KEY ("serviceID") references services ("serviceID") on update CASCADE on delete CASCADE,
  constraint reservations_userID_fkey foreign KEY ("userID") references profiles ("userID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger on_failed_reservation
after
update on reservations for EACH row
execute FUNCTION update_hour_on_canceled_reservation ();

create trigger on_reservation_accepted
after
update on reservations for EACH row
execute FUNCTION handle_reservation_acceptance ();

create trigger on_reservation_failed
after
update on reservations for EACH row
execute FUNCTION handle_failed_reservation ();

create table public.schedule (
  day text not null,
  hours time without time zone [] null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint schedule_pkey primary key (day)
) TABLESPACE pg_default;

create table public.services (
  "serviceID" uuid not null default gen_random_uuid (),
  name text null,
  price bigint null,
  description text null,
  updated_at timestamp without time zone null default now(),
  created_at timestamp with time zone not null default now(),
  "attainableCoin" smallint null,
  constraint services_pkey primary key ("serviceID")
) TABLESPACE pg_default;

create table public."userVouchers" (
  "voucherID" uuid not null default gen_random_uuid (),
  "userID" uuid not null default gen_random_uuid (),
  status public.userVoucherStatus null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  constraint userVouchers_userID_fkey foreign KEY ("userID") references profiles ("userID") on update CASCADE on delete CASCADE,
  constraint userVouchers_voucherID_fkey foreign KEY ("voucherID") references vouchers ("voucherID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create table public.vouchers (
  "voucherID" uuid not null default gen_random_uuid (),
  "serviceID" uuid null default gen_random_uuid (),
  title text null,
  description text null,
  value bigint null,
  "expireDate" date null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone null default now(),
  "startDate" date null,
  price smallint null,
  type public.voucherType null,
  constraint vouchers_pkey primary key ("voucherID"),
  constraint vouchers_serviceID_fkey foreign KEY ("serviceID") references services ("serviceID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;