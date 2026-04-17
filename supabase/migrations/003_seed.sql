INSERT INTO class_types (slug, name, description, category, duration_minutes, max_capacity, base_price, deposit_policy, sort_order) VALUES
('personalny-1-1', 'Trening personalny 1:1',
 'Indywidualny trening z trenerem — pełna koncentracja, spersonalizowany plan, maksymalne efekty.',
 'personal', 60, 1, 180.00, 'full_100', 1),
('duet', 'Trening w duecie',
 'Trening razem z partnerem lub znajomym. Ta sama jakość co 1:1, podzielona na dwie osoby.',
 'duet', 60, 2, 130.00, 'full_100', 2),
('mala-grupa', 'Mała grupa (do 6 os.)',
 'Kameralne zajęcia z intensywnym podejściem trenera. Jakość zbliżona do treningów indywidualnych.',
 'group_small', 60, 6, 70.00, 'partial_25', 3),
('zajecia-grupowe', 'Zajęcia grupowe',
 'Energetyczne treningi dla grup do 12 osób. Motywująca atmosfera, wysoka efektywność.',
 'group_large', 60, 12, 55.00, 'partial_25', 4);

INSERT INTO trainers (slug, first_name, last_name, bio, specialty, is_active, sort_order) VALUES
('marek-kowalski', 'Marek', 'Kowalski',
 'Certyfikowany trener personalny z 10-letnim doświadczeniem. Specjalizuje się w treningu siłowym i metamorfozach sylwetki. Pracował z zawodowymi sportowcami i osobami powracającymi po kontuzjach.',
 ARRAY['Trening siłowy', 'Metamorfoza sylwetki', 'Rehabilitacja'], true, 1),
('anna-nowak', 'Anna', 'Nowak',
 'Trenerka z pasją do funkcjonalnego ruchu. Ukończyła studia z wychowania fizycznego i kilkanaście specjalistycznych kursów. Pomaga klientom nie tylko wyglądać lepiej, ale też poruszać się sprawniej.',
 ARRAY['Trening funkcjonalny', 'Mobilność', 'Trening dla kobiet'], true, 2),
('tomasz-wojcik', 'Tomasz', 'Wójcik',
 'Były zawodnik MMA, dziś trener z misją. Specjalizuje się w HIIT, boksie i kondycji. Treningi z Tomkiem to czysta intensywność — z pełnym skupieniem na celu.',
 ARRAY['HIIT', 'Boks', 'Kondycja i wytrzymałość'], true, 3),
('katarzyna-lis', 'Katarzyna', 'Lis',
 'Dietetyczka sportowa i trenerka personalna. Łączy trening z edukacją żywieniową. Wierzy, że dobra forma to wynik stylu życia, a nie chwilowego poświęcenia.',
 ARRAY['Trening z dietetyką', 'Odchudzanie', 'Treningi dla mam'], true, 4);

DO $$
DECLARE
  v_personal UUID; v_duet UUID; v_small UUID; v_group UUID;
  v_marek UUID; v_anna UUID; v_tomek UUID; v_kasia UUID;
BEGIN
  SELECT id INTO v_personal FROM class_types WHERE slug = 'personalny-1-1';
  SELECT id INTO v_duet    FROM class_types WHERE slug = 'duet';
  SELECT id INTO v_small   FROM class_types WHERE slug = 'mala-grupa';
  SELECT id INTO v_group   FROM class_types WHERE slug = 'zajecia-grupowe';
  SELECT id INTO v_marek   FROM trainers WHERE slug = 'marek-kowalski';
  SELECT id INTO v_anna    FROM trainers WHERE slug = 'anna-nowak';
  SELECT id INTO v_tomek   FROM trainers WHERE slug = 'tomasz-wojcik';
  SELECT id INTO v_kasia   FROM trainers WHERE slug = 'katarzyna-lis';

  INSERT INTO sessions (class_type_id, trainer_id, starts_at, ends_at, max_capacity, price) VALUES
  (v_group, v_tomek, now()+'1 day'::interval+'7:00'::interval,  now()+'1 day'::interval+'8:00'::interval,  12, 55.00),
  (v_small, v_anna,  now()+'1 day'::interval+'9:00'::interval,  now()+'1 day'::interval+'10:00'::interval, 6,  70.00),
  (v_group, v_kasia, now()+'1 day'::interval+'18:00'::interval, now()+'1 day'::interval+'19:00'::interval, 12, 55.00),
  (v_group, v_tomek, now()+'2 day'::interval+'7:00'::interval,  now()+'2 day'::interval+'8:00'::interval,  12, 55.00),
  (v_small, v_marek, now()+'2 day'::interval+'10:00'::interval, now()+'2 day'::interval+'11:00'::interval, 6,  70.00),
  (v_group, v_anna,  now()+'3 day'::interval+'7:30'::interval,  now()+'3 day'::interval+'8:30'::interval,  12, 55.00),
  (v_small, v_tomek, now()+'3 day'::interval+'17:00'::interval, now()+'3 day'::interval+'18:00'::interval, 6,  70.00),
  (v_group, v_kasia, now()+'4 day'::interval+'8:00'::interval,  now()+'4 day'::interval+'9:00'::interval,  12, 55.00),
  (v_group, v_marek, now()+'5 day'::interval+'18:30'::interval, now()+'5 day'::interval+'19:30'::interval, 12, 55.00),
  (v_small, v_anna,  now()+'6 day'::interval+'10:00'::interval, now()+'6 day'::interval+'11:00'::interval, 6,  70.00),
  (v_group, v_tomek, now()+'7 day'::interval+'9:00'::interval,  now()+'7 day'::interval+'10:00'::interval, 12, 55.00),
  (v_small, v_kasia, now()+'8 day'::interval+'10:00'::interval, now()+'8 day'::interval+'11:00'::interval, 6,  70.00),
  (v_group, v_anna,  now()+'9 day'::interval+'7:00'::interval,  now()+'9 day'::interval+'8:00'::interval,  12, 55.00),
  (v_group, v_tomek, now()+'10 day'::interval+'18:00'::interval,now()+'10 day'::interval+'19:00'::interval,12, 55.00),
  (v_small, v_marek, now()+'11 day'::interval+'9:00'::interval, now()+'11 day'::interval+'10:00'::interval,6,  70.00);
END $$;
