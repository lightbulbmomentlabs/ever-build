-- ==============================================================================
-- Seed Contact Categories and Sub-Types
-- ==============================================================================
-- This migration seeds the contact_categories and contact_sub_types tables
-- with data from EverBuild-Sub-Types.md
--
-- Created: 2025-11-01
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Insert Main Categories
-- ------------------------------------------------------------------------------

INSERT INTO contact_categories (name, description, sort_order) VALUES
('PRE-CONSTRUCTION SERVICES', 'Design, engineering, and planning services', 1),
('SITE WORK & PREPARATION', 'Initial site preparation and earthwork', 2),
('FOUNDATION & CONCRETE', 'Foundation and concrete work', 3),
('STRUCTURAL & FRAMING', 'Structural and framing work', 4),
('EXTERIOR ENVELOPE', 'Exterior building envelope', 5),
('ROUGH-IN TRADES (MEP)', 'Mechanical, electrical, and plumbing rough-in', 6),
('INSULATION & ENVELOPE', 'Insulation and weatherproofing', 7),
('INTERIOR WALLS & CEILINGS', 'Interior wall and ceiling work', 8),
('INTERIOR FINISHES', 'Interior finish carpentry', 9),
('FLOORING', 'Flooring installation and finishing', 10),
('KITCHEN & BATH', 'Kitchen and bathroom fixtures and finishes', 11),
('PAINTING & FINISHING', 'Painting and decorative finishes', 12),
('SPECIALTY TRADES', 'Specialty installation work', 13),
('FINAL ELECTRICAL & PLUMBING', 'Electrical and plumbing finish work', 14),
('EXTERIOR COMPLETION', 'Exterior site completion work', 15),
('SPECIALTY SYSTEMS', 'Specialty building systems', 16),
('INSPECTIONS & TESTING', 'Inspection and testing services', 17),
('MATERIAL SUPPLIERS & VENDORS', 'Material suppliers and vendors', 18),
('SUPPORT SERVICES', 'Construction support services', 19),
('OTHER', 'Other services and contractors', 20);

-- ------------------------------------------------------------------------------
-- Insert Sub-Types for each Category
-- ------------------------------------------------------------------------------

-- PRE-CONSTRUCTION SERVICES (Category 1)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Architect', 1),
  ('Interior Designer', 2),
  ('Structural Engineer', 3),
  ('Civil Engineer', 4),
  ('Mechanical Engineer', 5),
  ('Electrical Engineer', 6),
  ('Plumbing Engineer', 7),
  ('MEP Engineer (Mechanical/Electrical/Plumbing)', 8),
  ('Land Surveyor', 9),
  ('Geotechnical Engineer / Soil Testing', 10),
  ('Environmental Consultant', 11),
  ('Cost Estimator', 12),
  ('Permitting Specialist', 13)
) AS subs(sub_type, sort_order)
WHERE name = 'PRE-CONSTRUCTION SERVICES';

-- SITE WORK & PREPARATION (Category 2)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Excavation / Earthwork', 1),
  ('Demolition', 2),
  ('Site Preparation', 3),
  ('Grading & Drainage', 4),
  ('Landscaping (Initial)', 5),
  ('Tree Removal / Clearing', 6),
  ('Erosion Control', 7)
) AS subs(sub_type, sort_order)
WHERE name = 'SITE WORK & PREPARATION';

-- FOUNDATION & CONCRETE (Category 3)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Foundation Contractor', 1),
  ('Concrete Contractor', 2),
  ('Concrete Pumping', 3),
  ('Waterproofing / Dampproofing', 4),
  ('Masonry / Bricklayer', 5)
) AS subs(sub_type, sort_order)
WHERE name = 'FOUNDATION & CONCRETE';

-- STRUCTURAL & FRAMING (Category 4)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Framing Contractor', 1),
  ('Rough Carpentry', 2),
  ('Structural Steel / Steel Erection', 3),
  ('Truss Manufacturer / Installation', 4),
  ('Engineered Wood Products', 5)
) AS subs(sub_type, sort_order)
WHERE name = 'STRUCTURAL & FRAMING';

-- EXTERIOR ENVELOPE (Category 5)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Roofing', 1),
  ('Siding Installation', 2),
  ('Stucco / EIFS', 3),
  ('Stone / Brick Veneer', 4),
  ('Window Installation', 5),
  ('Door Installation (Exterior)', 6),
  ('Garage Door Installation', 7),
  ('Gutter Installation', 8),
  ('Soffit & Fascia', 9)
) AS subs(sub_type, sort_order)
WHERE name = 'EXTERIOR ENVELOPE';

-- ROUGH-IN TRADES (MEP) (Category 6)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Plumbing (Rough-In)', 1),
  ('Electrical (Rough-In)', 2),
  ('HVAC Installation', 3),
  ('Gas Line Installation', 4),
  ('Fire Sprinkler System', 5)
) AS subs(sub_type, sort_order)
WHERE name = 'ROUGH-IN TRADES (MEP)';

-- INSULATION & ENVELOPE (Category 7)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Insulation Contractor', 1),
  ('Spray Foam Insulation', 2),
  ('Weatherization / Air Sealing', 3)
) AS subs(sub_type, sort_order)
WHERE name = 'INSULATION & ENVELOPE';

-- INTERIOR WALLS & CEILINGS (Category 8)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Drywall Installation', 1),
  ('Drywall Finishing / Taping', 2),
  ('Plastering', 3),
  ('Ceiling Installation (Drop/Acoustic)', 4)
) AS subs(sub_type, sort_order)
WHERE name = 'INTERIOR WALLS & CEILINGS';

-- INTERIOR FINISHES (Category 9)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Finish Carpentry / Trim', 1),
  ('Door Installation (Interior)', 2),
  ('Baseboard & Crown Molding', 3),
  ('Stair Builder / Handrails', 4),
  ('Built-In Cabinetry', 5),
  ('Shelving Installation', 6)
) AS subs(sub_type, sort_order)
WHERE name = 'INTERIOR FINISHES';

-- FLOORING (Category 10)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Hardwood Flooring', 1),
  ('Tile Installation (Floor)', 2),
  ('Carpet Installation', 3),
  ('Vinyl / LVP Flooring', 4),
  ('Laminate Flooring', 5),
  ('Concrete Staining / Polishing', 6),
  ('Floor Refinishing', 7)
) AS subs(sub_type, sort_order)
WHERE name = 'FLOORING';

-- KITCHEN & BATH (Category 11)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Cabinet Installation', 1),
  ('Countertop Fabrication & Installation', 2),
  ('Backsplash Installation', 3),
  ('Tile Installation (Wall)', 4),
  ('Shower/Tub Installation', 5),
  ('Glass Shower Enclosure', 6),
  ('Bathroom Fixtures', 7)
) AS subs(sub_type, sort_order)
WHERE name = 'KITCHEN & BATH';

-- PAINTING & FINISHING (Category 12)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Interior Painting', 1),
  ('Exterior Painting', 2),
  ('Staining', 3),
  ('Wallpaper Installation', 4),
  ('Decorative Finishes', 5)
) AS subs(sub_type, sort_order)
WHERE name = 'PAINTING & FINISHING';

-- SPECIALTY TRADES (Category 13)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Fireplace Installation', 1),
  ('Stone / Tile Mason', 2),
  ('Millwork / Custom Woodwork', 3),
  ('Glass & Glazing', 4),
  ('Mirrors Installation', 5),
  ('Window Treatments / Blinds', 6)
) AS subs(sub_type, sort_order)
WHERE name = 'SPECIALTY TRADES';

-- FINAL ELECTRICAL & PLUMBING (Category 14)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Electrical (Trim/Finish)', 1),
  ('Plumbing (Finish)', 2),
  ('Light Fixture Installation', 3),
  ('Appliance Installation', 4)
) AS subs(sub_type, sort_order)
WHERE name = 'FINAL ELECTRICAL & PLUMBING';

-- EXTERIOR COMPLETION (Category 15)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Concrete (Driveway, Walkways, Patio)', 1),
  ('Paving / Asphalt', 2),
  ('Deck Builder', 3),
  ('Fence Installation', 4),
  ('Landscaping (Final)', 5),
  ('Irrigation / Sprinkler System', 6),
  ('Outdoor Lighting', 7),
  ('Pool Installation', 8),
  ('Retaining Walls', 9)
) AS subs(sub_type, sort_order)
WHERE name = 'EXTERIOR COMPLETION';

-- SPECIALTY SYSTEMS (Category 16)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Security System', 1),
  ('Home Automation / Smart Home', 2),
  ('Audio/Visual Systems', 3),
  ('Structured Wiring / Low Voltage', 4),
  ('Solar Panel Installation', 5),
  ('Generator Installation', 6),
  ('Water Treatment System', 7),
  ('Central Vacuum', 8)
) AS subs(sub_type, sort_order)
WHERE name = 'SPECIALTY SYSTEMS';

-- INSPECTIONS & TESTING (Category 17)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Building Inspector (Municipal)', 1),
  ('Third-Party Inspector', 2),
  ('Home Energy Rater / HERS', 3),
  ('Radon Testing', 4),
  ('Termite Inspection', 5)
) AS subs(sub_type, sort_order)
WHERE name = 'INSPECTIONS & TESTING';

-- MATERIAL SUPPLIERS & VENDORS (Category 18)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Lumber Supplier', 1),
  ('Concrete Supplier', 2),
  ('Roofing Material Supplier', 3),
  ('Flooring Supplier', 4),
  ('Cabinet Supplier', 5),
  ('Countertop Supplier', 6),
  ('Plumbing Fixtures Supplier', 7),
  ('Electrical Supplies', 8),
  ('HVAC Equipment Supplier', 9),
  ('Appliance Supplier', 10),
  ('Hardware Supplier', 11),
  ('Paint Supplier', 12),
  ('Window & Door Supplier', 13)
) AS subs(sub_type, sort_order)
WHERE name = 'MATERIAL SUPPLIERS & VENDORS';

-- SUPPORT SERVICES (Category 19)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('Dumpster / Waste Removal', 1),
  ('Portable Toilet Rental', 2),
  ('Equipment Rental', 3),
  ('Scaffolding Rental', 4),
  ('Cleaning Service (Construction)', 5),
  ('Final Cleaning Service', 6),
  ('Punch List Specialist', 7)
) AS subs(sub_type, sort_order)
WHERE name = 'SUPPORT SERVICES';

-- OTHER (Category 20)
INSERT INTO contact_sub_types (category_id, name, sort_order)
SELECT id, sub_type, sort_order FROM contact_categories, (VALUES
  ('General Contractor', 1),
  ('Project Manager', 2),
  ('Expeditor (Permits/Materials)', 3),
  ('Custom (Other)', 4)
) AS subs(sub_type, sort_order)
WHERE name = 'OTHER';

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

-- Verify counts
DO $$
DECLARE
  category_count INTEGER;
  sub_type_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM contact_categories;
  SELECT COUNT(*) INTO sub_type_count FROM contact_sub_types;

  RAISE NOTICE 'Seeded % categories', category_count;
  RAISE NOTICE 'Seeded % sub-types', sub_type_count;

  IF category_count != 20 THEN
    RAISE EXCEPTION 'Expected 20 categories but found %', category_count;
  END IF;

  IF sub_type_count != 109 THEN
    RAISE WARNING 'Expected 191 sub-types but found % (verify against source)', sub_type_count;
  END IF;
END $$;

-- ==============================================================================
-- END OF SEED SCRIPT
-- ==============================================================================
