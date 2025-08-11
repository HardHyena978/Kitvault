--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase_in_cents integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: TABLE order_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.order_items IS 'Stores individual items for each order.';


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total_amount_in_cents integer NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    shipping_address text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: TABLE orders; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.orders IS 'Stores customer order information.';


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price_in_cents integer NOT NULL,
    image_url character varying(255),
    category character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    team_name character varying(100),
    team_type character varying(50),
    CONSTRAINT products_category_check CHECK (((category)::text = ANY ((ARRAY['retro'::character varying, 'current'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT products_team_type_check CHECK (((team_type)::text = ANY ((ARRAY['club'::character varying, 'nation'::character varying])::text[])))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products IS 'Stores all the jersey products available in the shop.';


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_admin boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price_at_purchase_in_cents) FROM stdin;
1	1	1	2	7499
2	2	1	2	7499
3	3	11	1	9499
4	4	25	1	9499
5	9	12	1	6999
6	10	2	1	6999
7	11	11	1	8499
8	12	13	1	8999
9	13	3	1	6999
10	14	2	1	6999
11	15	3	1	6999
12	16	6	2	7999
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, total_amount_in_cents, status, shipping_address, created_at) FROM stdin;
1	1	14998	completed	\N	2025-07-28 13:52:15.704389-07
2	1	14998	completed	\N	2025-07-28 15:40:49.475461-07
3	1	9499	completed	\N	2025-07-31 11:54:35.425631-07
4	1	9499	completed	\N	2025-08-01 12:05:22.757136-07
7	1	7999	pending	\N	2025-08-01 13:27:32.018451-07
8	1	6999	pending	\N	2025-08-01 13:35:22.796301-07
9	1	6999	completed	\N	2025-08-01 13:37:45.272529-07
10	1	6999	completed	\N	2025-08-01 13:49:44.041089-07
11	1	8499	completed	\N	2025-08-04 09:16:50.813955-07
12	1	8999	completed	\N	2025-08-04 09:24:42.723583-07
13	1	6999	completed	\N	2025-08-04 09:40:17.173022-07
14	1	6999	completed	\N	2025-08-04 09:42:38.425394-07
15	1	6999	completed	\N	2025-08-04 09:48:12.16329-07
16	1	15998	completed	\N	2025-08-04 09:56:37.99591-07
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price_in_cents, image_url, category, created_at, team_name, team_type) FROM stdin;
1	Netherlands 1988 Home	The iconic jersey worn during the victorious Euro 1988 campaign.	7499	assets/kit_images/netherlands_retro_home.jpg	retro	2025-07-22 08:56:28.844362-07	Netherlands	nation
2	Argentina 2024 Away	The latest away kit design for the reigning world champions.	6999	assets/kit_images/argentina_24_away.avif	current	2025-07-22 08:56:28.844362-07	Argentina	nation
3	Mexico 2025 Home	A bold new design for El Tri, inspired by ancient artistry.	6999	assets/kit_images/mexico_25_home.webp	current	2025-07-22 08:56:28.844362-07	Mexico	nation
4	Custom Fan Jersey	The base model for your personalized kit. Add your name and number!	8999	assets/kit_images/custom.jpg	custom	2025-07-22 08:56:28.844362-07	Custom	club
9	FC Barcelona 2025 Home	The famous Blaugrana stripes, redesigned for the new season.	7499	assets/kit_images/barca_home_25.webp	current	2025-07-22 09:36:18.2994-07	FC Barcelona	club
5	Argentina 1986 Home	The kit worn by Diego Maradona during his legendary World Cup triumph.	7999	assets/kit_images/argentina_retro_home.webp	retro	2025-07-22 09:36:18.2994-07	Argentina	nation
6	France 1998 Home	Zinedine Zidane led Les Bleus to World Cup glory on home soil in this timeless design.	7999	assets/kit_images/france_retro_home.jpg	retro	2025-07-22 09:36:18.2994-07	France	nation
7	Manchester United 1999 Home	The iconic treble-winning season kit, complete with the classic button-up collar.	8499	assets/kit_images/man_u_retro.webp	retro	2025-07-22 09:36:18.2994-07	Manchester United	club
8	Real Madrid 2026 Home	The pristine all-white home kit for the giants of Madrid. A symbol of victory.	7499	assets/kit_images/real_madrid_home_26.avif	current	2025-07-22 09:36:18.2994-07	Real Madrid	club
10	Liverpool 2025 Home	The classic all-red home kit for the Anfield faithful.	7299	assets/kit_images/liverpool_home_25.jpg	current	2025-07-22 09:36:18.2994-07	Liverpool	club
11	Germany 1990 Home	An all-time classic. One of the most celebrated and stylish jersey designs ever made.	8499	assets/kit_images/germany_retro.webp	retro	2025-07-22 09:36:18.2994-07	Germany	nation
12	LAFC 2025 Home	Represent Los Angeles with the iconic black and gold home kit of LAFC.	6999	assets/kit_images/lafc_home_25.avif	current	2025-07-22 09:36:18.2994-07	LAFC	club
13	Inter Miami 2025 Home	The vibrant pink home kit for Inter Miami, famously worn by Lionel Messi.	8999	assets/kit_images/inter_miami_25_home.avif	current	2025-07-23 12:32:26.335374-07	Inter Miami	club
14	Arsenal 2003-04 Home	The home kit from the legendary unbeaten "Invincibles" Premier League season.	7999	assets/kit_images/arsenal_2004_retro_home.jpg	retro	2025-07-23 12:32:26.335374-07	Arsenal	club
15	Manchester City 2025 Home	The sky blue home kit for the perennial Premier League champions.	7499	assets/kit_images/man_city_25_home.avif	current	2025-07-23 12:32:26.335374-07	Manchester City	club
16	Nigeria 1994 Home	One of the most stylish and celebrated jersey designs of all time, from Nigeria's iconic '94 squad.	8499	assets/kit_images/nigeria_retro_home.webp	retro	2025-07-23 12:32:26.335374-07	Nigeria	nation
36	Denmark 1986 Home	A legendary half-and-half design that became an instant cult classic.	8999	assets/kit_images/denmark_1986_home.webp	retro	2025-07-23 12:38:22.569882-07	Denmark	nation
42	Inter Milan 2010 Home	The home kit from a famous treble-winning season.	8299	assets/kit_images/inter_milan_2010_home.jpg	retro	2025-07-23 12:38:22.569882-07	Inter Milan	club
43	Chelsea 2012 Home	The home kit worn during a dramatic first European championship victory.	7999	assets/kit_images/chelsea_2012_home.webp	current	2025-07-23 12:38:22.569882-07	Chelsea	club
28	England 1990 Third	A popular and rare blue third kit design from a memorable tournament.	8499	assets/kit_images/england_1990_third.webp	retro	2025-07-23 12:38:22.569882-07	England	nation
29	Real Madrid 2002 Home	The all-white home kit from a celebratory centenary season.	8299	assets/kit_images/real_madrid_2002_home.jpg	retro	2025-07-23 12:38:22.569882-07	Real Madrid	club
32	Parma 1999 Home	A classic Serie A kit from a memorable and talented squad.	8299	assets/kit_images/parma_1990_home.webp	retro	2025-07-23 12:38:22.569882-07	Parma	club
33	AS Roma 2001 Home	The home kit from a famous title-winning season in the Italian capital.	7999	assets/kit_images/roma_2001_home.jpg	retro	2025-07-23 12:38:22.569882-07	AS Roma	club
34	Lazio 2000 Home	The sky blue home kit celebrating a historic league title.	7999	assets/kit_images/lazio_2000_home.jpg	retro	2025-07-23 12:38:22.569882-07	Lazio	club
35	Colombia 1990 Home	A bold and colorful home jersey from a classic era of Colombian football.	8499	assets/kit_images/colombia_1990_home.webp	retro	2025-07-23 12:38:22.569882-07	Colombia	nation
44	Manchester City 2012 Home	The home kit from a dramatic, last-minute title-winning goal.	7999	assets/kit_images/man_city_2012_home.jpg	current	2025-07-23 12:38:22.569882-07	Manchester City	club
45	Bayern Munich 2013 Home	The home kit from a dominant treble-winning season.	7999	assets/kit_images/bayern_2013_home.webp	current	2025-07-23 12:38:22.569882-07	Bayern Munich	club
46	Atletico Madrid 2014 Home	The home kit from a surprising and hard-fought league title victory.	7499	assets/kit_images/athletico_2015_home.webp	current	2025-07-23 12:38:22.569882-07	Atletico Madrid	club
47	Leicester City 2016 Home	The home kit from one of the most unexpected title wins in sports history.	7999	assets/kit_images/leicester_city_2016_home.jpg	current	2025-07-23 12:38:22.569882-07	Leicester City	club
48	Real Madrid 2017 Away	A stylish purple away kit from a dominant league and European season.	7499	assets/kit_images/real_madrid_2017_away.webp	current	2025-07-23 12:38:22.569882-07	Real Madrid	club
49	France 2018 Home	The dark blue home kit worn en route to a second world title.	7999	assets/kit_images/france_2018_home.webp	current	2025-07-23 12:38:22.569882-07	France	nation
37	Mexico 1998 Home	An unforgettable home kit featuring a vibrant and artistic design.	8499	assets/kit_images/mexico_1998_home.webp	retro	2025-07-23 12:38:22.569882-07	Mexico	nation
38	USA 1994 Away	The iconic "denim stars" away kit from the tournament held on home soil.	8999	assets/kit_images/usa_1994_away.jpg	retro	2025-07-23 12:38:22.569882-07	USA	nation
17	Bayern Munich 2025 Home	The classic red home kit for the German powerhouse, FC Bayern Munich.	7299	assets/kit_images/bayern_25_home.avif	current	2025-07-23 12:32:26.335374-07	Bayern Munich	club
18	Italy 1990 Home	A masterpiece of jersey design, worn by the host nation during the Italia '90 World Cup.	7999	assets/kit_images/italy_1990_retro_home.jpg	retro	2025-07-23 12:32:26.335374-07	Italy	nation
19	Boca Juniors 1995 Home	The vibrant blue and gold kit from the iconic La Bombonera, worn by a returning Diego Maradona.	8499	assets/kit_images/boca_97_retro_home.jpg	retro	2025-07-23 12:32:26.335374-07	Boca Juniors	club
20	USWNT 2025 Home	The latest home kit for the United States Women's National Team, four-time World Cup champions.	8999	assets/kit_images/uswnt_25_home.avif	current	2025-07-23 12:32:26.335374-07	USWNT	nation
21	AC Milan 1992 Home	Iconic home kit from a dominant era for the Rossoneri.	8499	assets/kit_images/ac_milan_1992_retro_home.webp	retro	2025-07-23 12:38:22.569882-07	AC Milan	club
22	Liverpool 1989 Home	A classic red home shirt from the late 80s at Anfield.	7999	assets/kit_images/liverpool_1989_retro_home.jpg	retro	2025-07-23 12:38:22.569882-07	Liverpool	club
23	Juventus 1996 Home	The famous black and white stripes from a memorable European season.	8299	assets/kit_images/juventus_1996_home.jpg	retro	2025-07-23 12:38:22.569882-07	Juventus	club
24	Ajax 1995 Away	A beloved away kit design from a legendary Amsterdam squad.	8999	assets/kit_images/ajax_1995_away.webp	retro	2025-07-23 12:38:22.569882-07	Ajax	club
25	Barcelona 1997 Away	A striking away jersey featuring a unique and memorable design.	8499	assets/kit_images/barca_1997_away.webp	retro	2025-07-23 12:38:22.569882-07	Barcelona	club
26	Inter Milan 1998 Away	A stylish hooped away kit worn during a famous European campaign.	7999	assets/kit_images/inter_milan_1998_away.jpg	retro	2025-07-23 12:38:22.569882-07	Inter Milan	club
27	West Germany 1988 Home	An iconic and influential design worn by the German national team.	8999	assets/kit_images/west_germany_1988_home.webp	retro	2025-07-23 12:38:22.569882-07	West Germany	nation
30	Chelsea 2005 Home	The home kit from a dominant, title-winning season in London.	7999	assets/kit_images/chelsea_2005_home.jpg	retro	2025-07-23 12:38:22.569882-07	Chelsea	club
31	Borussia Dortmund 1997 Home	The vibrant yellow and black home kit from a European title season.	8499	assets/kit_images/dortmund_1997_home.webp	retro	2025-07-23 12:38:22.569882-07	Borussia Dortmund	club
39	Fiorentina 1998 Home	The famous purple home kit featuring a memorable sponsor and design.	8299	assets/kit_images/fiorentina_1998_home.webp	retro	2025-07-23 12:38:22.569882-07	Fiorentina	club
40	Celtic 1988 Home	A classic green and white hooped jersey from a centenary season.	7999	assets/kit_images/celtic_1987_home.jpg	retro	2025-07-23 12:38:22.569882-07	Celtic	club
41	Barcelona 2009 Home	The home kit from a historic six-trophy winning season.	8499	assets/kit_images/barca_2009_home.webp	retro	2025-07-23 12:38:22.569882-07	Barcelona	club
50	Liverpool 2019 Home	The home kit worn during a sixth European championship victory.	7999	assets/kit_images/liverpool_2019_home.jpg	current	2025-07-23 12:38:22.569882-07	Liverpool	club
51	PSG 2021 Home	The home kit featuring the iconic Hechter stripe design.	7499	assets/kit_images/psg_2021_home.jpg	current	2025-07-23 12:38:22.569882-07	PSG	club
52	AC Milan 2022 Home	The home kit from a celebrated return to the top of Italian football.	7499	assets/kit_images/ac_milan_2022_home.webp	current	2025-07-23 12:38:22.569882-07	AC Milan	club
53	Napoli 2023 Home	The sky blue home kit from a historic, long-awaited league title.	7999	assets/kit_images/napoli_2023_home.webp	current	2025-07-23 12:38:22.569882-07	Napoli	club
54	Arsenal 2024 Away	A vibrant and popular away kit from a resurgent Arsenal team.	7299	assets/kit_images/arsenal_2024_home.jpg	current	2025-07-23 12:38:22.569882-07	Arsenal	club
55	Japan 2022 Home	A stylish and artistic home kit that was a fan favorite.	7999	assets/kit_images/japan_2022_home.jpg	current	2025-07-23 12:38:22.569882-07	Japan	nation
56	Morocco 2022 Home	The home kit from a historic and inspiring semi-final run.	7999	assets/kit_images/morocco_2022_home.jpg	current	2025-07-23 12:38:22.569882-07	Morocco	nation
57	LA Galaxy 2023 Home	The classic white home jersey for the original MLS powerhouse.	6999	assets/kit_images/la_galaxy_2024_home.jpg	current	2025-07-23 12:38:22.569882-07	LA Galaxy	club
58	Atlanta United 2024 Home	The iconic five stripes home kit representing the city of Atlanta.	6999	assets/kit_images/atlanta_united_2024_home.jpg	current	2025-07-23 12:38:22.569882-07	Atlanta United	club
59	Tottenham 2019 Away	A dark away kit worn during a memorable run in European competition.	7499	assets/kit_images/tottenham_2019_away.jpg	current	2025-07-23 12:38:22.569882-07	Tottenham	club
60	Portugal 2016 Home	The home kit worn during a hard-fought first major international trophy win.	7999	assets/kit_images/portugal_2016_home.jpg	current	2025-07-23 12:38:22.569882-07	Portugal	nation
61	River Plate 2018 Home	The iconic home kit with the red sash from a continental triumph.	7999	assets/kit_images/riverplate_2018_home.jpg	current	2025-07-23 12:38:22.569882-07	River Plate	club
62	Boca Juniors 2023 Home	The classic blue and gold home jersey from La Bombonera.	7999	assets/kit_images/boca_2023_home.jpg	current	2025-07-23 12:38:22.569882-07	Boca Juniors	club
63	AS Monaco 2017 Home	The home kit from a thrilling, title-winning season with a young squad.	7499	assets/kit_images/as_monaco_2017_home.jpg	current	2025-07-23 12:38:22.569882-07	AS Monaco	club
64	Netherlands 2010 Away	A stylish white away kit worn in a major final.	7999	assets/kit_images/netherlands_2010_away.webp	current	2025-07-23 12:38:22.569882-07	Netherlands	nation
65	Spain 2012 Home	The home kit worn to secure an unprecedented third consecutive major trophy.	8299	assets/kit_images/spain_2011_home.webp	current	2025-07-23 12:38:22.569882-07	Spain	nation
66	Uruguay 2010 Home	The classic sky blue home kit from an exciting tournament run.	7999	assets/kit_images/uruguay_2010_home.jpg	current	2025-07-23 12:38:22.569882-07	Uruguay	nation
67	Belgium 2018 Home	A unique home kit featuring a central crest and argyle pattern.	7499	assets/kit_images/belgium_2018_home.jpg	current	2025-07-23 12:38:22.569882-07	Belgium	nation
68	Croatia 2018 Home	The iconic checkered home kit from a historic run to a major final.	7999	assets/kit_images/croatia_2018_home.jpg	current	2025-07-23 12:38:22.569882-07	Croatia	nation
69	PSV Eindhoven 1988 Home	The red and white striped home kit from a European Cup winning season.	8499	assets/kit_images/psv_1988_home.jpg	retro	2025-07-23 12:38:22.569882-07	PSV Eindhoven	club
70	Red Star Belgrade 1991 Home	The red and white home kit from a historic European Cup victory.	8499	assets/kit_images/red_star_1991_home.jpg	retro	2025-07-23 12:38:22.569882-07	Red Star Belgrade	club
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, created_at, is_admin) FROM stdin;
1	Test User	test@gmail.com	$2b$10$Qbkc3B4/YUoU9DOM/eKZ2OZC8EWEYE3TJT7y43kAPR/RZjAFahIzu	2025-07-23 18:18:00.53733-07	f
3	Administrator	admin@kitvault.com	$2b$10$2WkrErSiM2n.qYgDwDtsBe7knGuCv8x.hfVAaFUY1asiWkM1Xo4OC	2025-08-04 10:16:46.889456-07	t
\.


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 12, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 16, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 70, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

