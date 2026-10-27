-- MCL ICCC Smart Municipal Complaint Management System
-- Migration 002: Seed Initial Reference & Deduplicated Roster Data

-- 1. Core Departments
INSERT INTO departments (code, name) VALUES
('OM', 'Operation & Maintenance (Water & Sewerage)'),
('BR', 'Buildings & Roads'),
('HEALTH', 'Health & Sanitation'),
('LIGHT', 'Street Lighting')
ON CONFLICT (code) DO NOTHING;

-- 2. Municipal Zones
INSERT INTO municipal_zones (code, name, commissioner_name) VALUES
('A', 'Zone A', 'Sh. Amanpreet Singh, PCS'),
('B', 'Zone B', 'Sh. Niraj Jain, AC'),
('C', 'Zone C', 'Sh. Gurpal, AC'),
('D', 'Zone D', 'Sh. Jasdev Sekhon, AC')
ON CONFLICT (code) DO NOTHING;

-- 3. 15 Complaint Categories
INSERT INTO complaint_categories (code, name, branch, joint_label) VALUES
('cat_01', 'Blocked Road Gully', 'O&M', 'Blocked Road Gully - O&M'),
('cat_02', 'Open Manhole', 'O&M', 'Open Manhole - O&M'),
('cat_03', 'Water Logging', 'O&M', 'Water Logging - O&M'),
('cat_04', 'Tree Fall', 'Health', 'Tree Fall - Health'),
('cat_05', 'Contamination', 'O&M', 'Contamination - O&M'),
('cat_06', 'Potholes', 'B&R', 'Potholes - B&R'),
('cat_07', 'New Road Construction', 'B&R', 'New Road Construction - B&R'),
('cat_08', 'Garbage Valnuerable Points (GVP)', 'Health', 'Garbage Valnuerable Points (GVP) - Health'),
('cat_09', 'New Pipeline Water/Sewer', 'O&M', 'New Pipeline Water/Sewer - O&M'),
('cat_10', 'Old Pipeline Burst', 'O&M', 'Old Pipeline Burst - O&M'),
('cat_11', 'Leakage Pipeline', 'O&M', 'Leakage Pipeline - O&M'),
('cat_12', 'Sewerage/Road Jalis Overchock.', 'O&M', 'Sewerage/Road Jalis Overchock. - O&M'),
('cat_13', 'Sewerage/Road Jalis Desiliting', 'O&M', 'Sewerage/Road Jalis Desiliting - O&M'),
('cat_14', 'Street Light Issues', 'Light', 'Street Light Issues - Light'),
('cat_15', 'New road gully', 'B&R', 'New road gully - B&R')
ON CONFLICT (code) DO NOTHING;

-- 4. 95 Municipal Wards
INSERT INTO municipal_wards (ward_number, zone_code, constituency, mla_name) VALUES
(1, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(2, 'A', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(3, 'A', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(4, 'A', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(5, 'A', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(6, 'A', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(7, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(8, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(9, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(10, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(11, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(12, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(13, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(14, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(15, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(16, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(17, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(18, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(19, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(20, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(21, 'B', 'Sahnewal', 'Sh. Hardeep Singh Mundian (Sahnewal)'),
(22, 'B', 'Sahnewal', 'Sh. Hardeep Singh Mundian (Sahnewal)'),
(23, 'B', 'Sahnewal', 'Sh. Hardeep Singh Mundian (Sahnewal)'),
(24, 'B', 'Sahnewal', 'Sh. Hardeep Singh Mundian (Sahnewal)'),
(25, 'B', 'Sahnewal', 'Sh. Hardeep Singh Mundian (Sahnewal)'),
(26, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(27, 'B', 'South', 'Smt. Rajinderpal Kaur South'),
(28, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(29, 'B', 'East', 'Sh. Daljit Singh Grewal (Bhola) (East)'),
(30, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(31, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(32, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(33, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(34, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(35, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(36, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(37, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(38, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(39, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(40, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(41, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(42, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(43, 'C', 'South', 'Smt. Rajinderpal Kaur South'),
(44, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(45, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(46, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(47, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(48, 'C', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(49, 'D', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(50, 'D', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(51, 'D', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(52, 'D', 'AtamNagar', 'Sh. Kulwant Singh Sidhu (AtamNagar)'),
(53, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(54, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(55, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(56, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(57, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(58, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(59, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(60, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(61, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(62, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(63, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(64, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(65, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(66, 'D', 'North', 'Sh. Madan Lal Bagga (North)'),
(67, 'D', 'North', 'Sh. Madan Lal Bagga (North)'),
(68, 'D', 'North', 'Sh. Madan Lal Bagga (North)'),
(69, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(70, 'D', 'North', 'Sh. Madan Lal Bagga (North)'),
(71, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(72, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(73, 'D', 'West', 'Sh. Sanjeev Arora (West)'),
(74, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(75, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(76, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(77, 'A', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(78, 'A', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(79, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(80, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(81, 'B', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(82, 'A', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(83, 'A', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(84, 'A', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(85, 'A', 'Central', 'Sh. Ashok Prashar (Pappi) (Central)'),
(86, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(87, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(88, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(89, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(90, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(91, 'D', 'North', 'Sh. Madan Lal Bagga (North)'),
(92, 'D', 'North', 'Sh. Madan Lal Bagga (North)'),
(93, 'D', 'North', 'Sh. Madan Lal Bagga (North)'),
(94, 'A', 'North', 'Sh. Madan Lal Bagga (North)'),
(95, 'A', 'North', 'Sh. Madan Lal Bagga (North)')
ON CONFLICT (ward_number) DO NOTHING;

-- 5. Standard Admin & Operator Accounts + 72 Deduplicated Staff Accounts
INSERT INTO users (name, phone_number, role, designation, pin_hash, branch, zone_code) VALUES
('MUKESH (Operator Desk)', '9876543210', 'operator', 'ICCC Control Room Operator', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'ICCC', 'A'),
('ICCC System Administrator', '9999999999', 'admin', 'System Administrator', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'ICCC', 'A'),
('Raman Kaushal', '9888162620', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'A'),
('Akshay Bansal', '9041163066', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'A'),
('Vikas Kumar', '9646222900', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'A'),
('Kamal Ram', '9780221000', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'A'),
('Anshul Garcha', '9815144612', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'A'),
('Himanshu Sharma', '9217882000', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'A'),
('Ashwani Sahota', '9876900475', 'xen', 'Dr Nodal Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'A'),
('Surinder Dogra', '9780019313', 'je', 'Chief Sanitary Inspector', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'A'),
('Kulwinder Singh', '9888897201', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'A'),
('Amandeep Singh', '9501718752', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'A'),
('Sandeep Singh', '8284800951', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'A'),
('Sukhdeep Singh', '9888977577', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'A'),
('Parwinder Singh', '7009825859', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'A'),
('Prabhjot Singh', '7973435016', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Ashutosh Tiwari', '9988352461', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Baljinder Singh', '9988850855', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Sh. Ramandeep Singh', '9855523213', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Ravi Dogra', '9780064002', 'sdo', 'Medical Officer of Health', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'B'),
('Nishu Ghai', '9780112300', 'je', 'Chief Sanitary Inspector', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'B'),
('Sanjeev Kumar', '9780039448', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Simarjeet Singh', '7508243093', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Vikas Sethi', '9988900126', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Sandeep Sharma', '9592999599', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Rajneesh Kumar', '9915271963', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Ravi Sharma', '8591109999', 'je', 'Chief Sanitary Inspector', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'B'),
('Gurjit Singh', '9815014886', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Amritpal Singh', '8146288822', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Gaurav Thappar', '9988291286', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Samarveer Grewal', '9780039835', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Davinder Pal Harinder Singh', '9780033766', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Avtar', '7986807720', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Shashi Kant', '8872121914', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Pawanpreet Singh', '9888663023', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Karan Pathak', '9815220788', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Rajinder', '8195019050', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'B'),
('Manpreet Singh', '8146099950', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Iqbal Singh & Avneet Singh', '9988812321', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Vipal Malhotra', '9780011515', 'xen', 'Dr Nodal Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'C'),
('Gurinder Singh', '9988797188', 'sdo', 'Medical Officer of Health', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'C'),
('Rajinder Kalyan', '9780012331', 'je', 'Chief Sanitary Inspector', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'Health', 'C'),
('Harbir Singh', '8699100033', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Sanpreet Singh', '9646832849', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Dilpreet Singh & Avneet Singh', '9988549001', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Sandeep', '8837873503', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'C'),
('Amandeep Singh Grewal', '9988830795', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Jagroop Singh & Amandeep Singh Grewal', '9780022546', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Bhupinder Singh 97816-08300 & Pankush Nanda', '9780801786', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'C'),
('Ramandeep kaur & Harjot Pal Singh', '9878584763', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'C'),
('Randeep Singh', '9814355554', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Baljeet Singh', '9988550855', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Gokaran Singh', '9988831600', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Harjot Pal Singh', '7009670765', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Arvind Kumar', '9780039452', 'xen', 'Executive Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Rupinder Singh', '7837100158', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Kuldeep Singh', '9988400532', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Vaneet Kumar', '9780039813', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Nisha', '9872354972', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Jatinder Sodhi', '9780511500', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Harkesh Kumar', '8427134132', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Naresh Kumar', '9780024113', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Baljinder singh', '9814720996', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Ankush Sharma', '7986605351', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Karan', '7814899197', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Arjun Sikka', '9888933130', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Gurpreet Singh', '8847207893', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Gurdeep Singh', '7888927362', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Harpreet Kaur', '9781507993', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'D'),
('Tejinder Singh', '8054030020', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'B'),
('Sachin Isha Teji 788853738', '8437229223', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'A'),
('Balwinder Singh', '9023620049', 'je', 'Junior Engineer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'O&M', 'A'),
('Gurpreet Singh', '8847207894', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D'),
('Gurpreet Singh', '8847207895', 'sdo', 'Sub-Divisional Officer', '$2a$10$a7i/6eU75PwI5WyFIZquHOkkAVTQ1xsgoGg37AGDnj7BB8hbi8AUS', 'B&R', 'D')
ON CONFLICT (phone_number) DO NOTHING;

-- 6. Staff Territorial Assignments
INSERT INTO staff_area_assignments (user_id, branch, ward_number, zone_code, is_primary)
SELECT id, 'B&R', 1, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 1, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 1, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 1, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 1, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 1, 'A', TRUE FROM users WHERE phone_number = '9217882000'
UNION ALL
SELECT id, 'Health', 1, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 1, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 1, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 1, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 1, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'B&R', 2, 'A', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 2, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'B&R', 2, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'O&M', 2, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 2, 'A', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 2, 'A', TRUE FROM users WHERE phone_number = '7009825859'
UNION ALL
SELECT id, 'Health', 2, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 2, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 2, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 2, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'Light', 2, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'B&R', 3, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 3, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'B&R', 3, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'O&M', 3, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 3, 'A', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 3, 'A', TRUE FROM users WHERE phone_number = '7009825859'
UNION ALL
SELECT id, 'Health', 3, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 3, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 3, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 3, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'Light', 3, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'B&R', 4, 'A', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 4, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'B&R', 4, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'O&M', 4, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 4, 'A', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 4, 'A', TRUE FROM users WHERE phone_number = '7009825859'
UNION ALL
SELECT id, 'Health', 4, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 4, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 4, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 4, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'Light', 4, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'B&R', 5, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 5, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'B&R', 5, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'O&M', 5, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 5, 'A', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 5, 'A', TRUE FROM users WHERE phone_number = '7009825859'
UNION ALL
SELECT id, 'Health', 5, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 5, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 5, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 5, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'Light', 5, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'B&R', 6, 'A', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 6, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'B&R', 6, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'O&M', 6, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 6, 'A', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 6, 'A', TRUE FROM users WHERE phone_number = '7009825859'
UNION ALL
SELECT id, 'Health', 6, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 6, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 6, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 6, 'A', FALSE FROM users WHERE phone_number = '9501718752'
UNION ALL
SELECT id, 'Light', 6, 'A', TRUE FROM users WHERE phone_number = '8284800951'
UNION ALL
SELECT id, 'B&R', 7, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 7, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 7, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 7, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 7, 'B', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 7, 'B', TRUE FROM users WHERE phone_number = '9855523213'
UNION ALL
SELECT id, 'Health', 7, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 7, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 7, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 7, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 7, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 8, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 8, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 8, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 8, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 8, 'A', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 8, 'A', TRUE FROM users WHERE phone_number = '9217882000'
UNION ALL
SELECT id, 'Health', 8, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 8, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 8, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 8, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 8, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'B&R', 9, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 9, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 9, 'B', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'O&M', 9, 'B', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 9, 'B', FALSE FROM users WHERE phone_number = '9592999599'
UNION ALL
SELECT id, 'O&M', 9, 'B', TRUE FROM users WHERE phone_number = '9915271963'
UNION ALL
SELECT id, 'Health', 9, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 9, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 9, 'B', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 9, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 9, 'B', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'B&R', 10, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 10, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 10, 'B', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'O&M', 10, 'B', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 10, 'B', FALSE FROM users WHERE phone_number = '9592999599'
UNION ALL
SELECT id, 'O&M', 10, 'B', TRUE FROM users WHERE phone_number = '9915271963'
UNION ALL
SELECT id, 'Health', 10, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 10, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 10, 'B', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 10, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 10, 'B', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'B&R', 11, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 11, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 11, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 11, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 11, 'B', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 11, 'B', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 11, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 11, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 11, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 11, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 11, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 12, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 12, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 12, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 12, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 12, 'B', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 12, 'B', TRUE FROM users WHERE phone_number = '9855523213'
UNION ALL
SELECT id, 'Health', 12, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 12, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 12, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 12, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 12, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 13, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 13, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 13, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 13, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 13, 'B', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 13, 'B', TRUE FROM users WHERE phone_number = '9855523213'
UNION ALL
SELECT id, 'Health', 13, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 13, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 13, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 13, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 13, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 14, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 14, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 14, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 14, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 14, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 14, 'B', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 14, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 14, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 14, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 14, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 14, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 15, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 15, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 15, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 15, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 15, 'B', FALSE FROM users WHERE phone_number = '9888977577'
UNION ALL
SELECT id, 'O&M', 15, 'B', TRUE FROM users WHERE phone_number = '9855523213'
UNION ALL
SELECT id, 'Health', 15, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 15, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 15, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 15, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 15, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 16, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 16, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 16, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 16, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 16, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 16, 'B', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 16, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 16, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 16, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 16, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 16, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 17, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 17, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'B&R', 17, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 17, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 17, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 17, 'B', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 17, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 17, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 17, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 17, 'B', FALSE FROM users WHERE phone_number = '7973435016'
UNION ALL
SELECT id, 'Light', 17, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 18, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 18, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 18, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 18, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 18, 'B', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 18, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 18, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 18, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 18, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 19, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 19, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 19, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 19, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 19, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 19, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 19, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 19, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 19, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 20, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 20, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 20, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 20, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 20, 'B', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 20, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 20, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 20, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 20, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 21, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 21, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'B&R', 21, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 21, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 21, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 21, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 21, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 21, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 21, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 21, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'Light', 21, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 22, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 22, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 22, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 22, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 22, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 22, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 22, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 22, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 22, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 23, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 23, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 23, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 23, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 23, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 23, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 23, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 23, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 23, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 24, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 24, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'O&M', 24, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 24, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 24, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 24, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 24, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 24, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 24, 'B', TRUE FROM users WHERE phone_number = '9988352461'
UNION ALL
SELECT id, 'B&R', 25, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 25, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'B&R', 25, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 25, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 25, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 25, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 25, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 25, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 25, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 25, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'Light', 25, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 26, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 26, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'B&R', 26, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 26, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 26, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 26, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 26, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 26, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 26, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 26, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'Light', 26, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 27, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 27, 'B', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 27, 'B', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 27, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 27, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 27, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 27, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 27, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 27, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 27, 'B', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 27, 'B', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 28, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 28, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'B&R', 28, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 28, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 28, 'B', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 28, 'B', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 28, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 28, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 28, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 28, 'B', FALSE FROM users WHERE phone_number = '7986807720'
UNION ALL
SELECT id, 'Light', 28, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 29, 'B', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 29, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 29, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 29, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 29, 'B', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 29, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 29, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 29, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 29, 'B', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 30, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 30, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 30, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'O&M', 30, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 30, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 30, 'B', TRUE FROM users WHERE phone_number = '8195019050'
UNION ALL
SELECT id, 'Health', 30, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 30, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 30, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 30, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 30, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'B&R', 31, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 31, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 31, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 31, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 31, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 31, 'C', TRUE FROM users WHERE phone_number = '9988812321'
UNION ALL
SELECT id, 'Health', 31, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 31, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 31, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 31, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 31, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 32, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 32, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 32, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 32, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 32, 'C', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 32, 'C', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 32, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 32, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 32, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 32, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 32, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 33, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 33, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 33, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 33, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 33, 'C', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 33, 'C', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 33, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 33, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 33, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 33, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 33, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 34, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 34, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 34, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 34, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 34, 'C', FALSE FROM users WHERE phone_number = '9780039835'
UNION ALL
SELECT id, 'O&M', 34, 'C', TRUE FROM users WHERE phone_number = '9780033766'
UNION ALL
SELECT id, 'Health', 34, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 34, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 34, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 34, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 34, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 35, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 35, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 35, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 35, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 35, 'C', FALSE FROM users WHERE phone_number = '8699100033'
UNION ALL
SELECT id, 'O&M', 35, 'C', TRUE FROM users WHERE phone_number = '9646832849'
UNION ALL
SELECT id, 'Health', 35, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 35, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 35, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 35, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 35, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 36, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 36, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 36, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 36, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 36, 'C', FALSE FROM users WHERE phone_number = '8699100033'
UNION ALL
SELECT id, 'O&M', 36, 'C', TRUE FROM users WHERE phone_number = '9988549001'
UNION ALL
SELECT id, 'Health', 36, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 36, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 36, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 36, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 36, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 37, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 37, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 37, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 37, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 37, 'C', FALSE FROM users WHERE phone_number = '8699100033'
UNION ALL
SELECT id, 'O&M', 37, 'C', TRUE FROM users WHERE phone_number = '9988549001'
UNION ALL
SELECT id, 'Health', 37, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 37, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 37, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 37, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 37, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 38, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 38, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 38, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 38, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 38, 'C', FALSE FROM users WHERE phone_number = '8699100033'
UNION ALL
SELECT id, 'O&M', 38, 'C', TRUE FROM users WHERE phone_number = '9988549001'
UNION ALL
SELECT id, 'Health', 38, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 38, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 38, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 38, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 38, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 39, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 39, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 39, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 39, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 39, 'C', FALSE FROM users WHERE phone_number = '8699100033'
UNION ALL
SELECT id, 'O&M', 39, 'C', TRUE FROM users WHERE phone_number = '9988549001'
UNION ALL
SELECT id, 'Health', 39, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 39, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 39, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 39, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 39, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 40, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 40, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'B&R', 40, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 40, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 40, 'C', FALSE FROM users WHERE phone_number = '9988830795'
UNION ALL
SELECT id, 'O&M', 40, 'C', TRUE FROM users WHERE phone_number = '9646832849'
UNION ALL
SELECT id, 'Health', 40, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 40, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 40, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 40, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'Light', 40, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 41, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 41, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'B&R', 41, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 41, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 41, 'C', FALSE FROM users WHERE phone_number = '9988830795'
UNION ALL
SELECT id, 'O&M', 41, 'C', TRUE FROM users WHERE phone_number = '9646832849'
UNION ALL
SELECT id, 'Health', 41, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 41, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 41, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 41, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'Light', 41, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 42, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 42, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'B&R', 42, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 42, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 42, 'C', FALSE FROM users WHERE phone_number = '9988830795'
UNION ALL
SELECT id, 'O&M', 42, 'C', TRUE FROM users WHERE phone_number = '9646832849'
UNION ALL
SELECT id, 'Health', 42, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 42, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 42, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 42, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'Light', 42, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 43, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 43, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'B&R', 43, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 43, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 43, 'C', FALSE FROM users WHERE phone_number = '9780022546'
UNION ALL
SELECT id, 'O&M', 43, 'C', TRUE FROM users WHERE phone_number = '9646832849'
UNION ALL
SELECT id, 'Health', 43, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 43, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 43, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 43, 'C', FALSE FROM users WHERE phone_number = '8872121914'
UNION ALL
SELECT id, 'Light', 43, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 44, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 44, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 44, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 44, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 44, 'C', TRUE FROM users WHERE phone_number = '9988812321'
UNION ALL
SELECT id, 'Health', 44, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 44, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 44, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 44, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 45, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 45, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 45, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 45, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 45, 'C', TRUE FROM users WHERE phone_number = '9988812321'
UNION ALL
SELECT id, 'Health', 45, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 45, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 45, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 45, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 46, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 46, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 46, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 46, 'C', FALSE FROM users WHERE phone_number = '9988830795'
UNION ALL
SELECT id, 'O&M', 46, 'C', TRUE FROM users WHERE phone_number = '9646832849'
UNION ALL
SELECT id, 'Health', 46, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 46, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 46, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 47, 'C', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 47, 'C', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'B&R', 47, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 47, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 47, 'C', FALSE FROM users WHERE phone_number = '9988830795'
UNION ALL
SELECT id, 'O&M', 47, 'C', TRUE FROM users WHERE phone_number = '9878584763'
UNION ALL
SELECT id, 'Health', 47, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 47, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 47, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 47, 'C', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'Light', 47, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 48, 'C', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 48, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'B&R', 48, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 48, 'C', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 48, 'C', FALSE FROM users WHERE phone_number = '9988830795'
UNION ALL
SELECT id, 'O&M', 48, 'C', TRUE FROM users WHERE phone_number = '9988549001'
UNION ALL
SELECT id, 'Health', 48, 'C', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 48, 'C', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 48, 'C', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 48, 'C', FALSE FROM users WHERE phone_number = '8837873503'
UNION ALL
SELECT id, 'Light', 48, 'C', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 49, 'D', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 49, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'O&M', 49, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 49, 'D', FALSE FROM users WHERE phone_number = '9988550855'
UNION ALL
SELECT id, 'O&M', 49, 'D', TRUE FROM users WHERE phone_number = '9988831600'
UNION ALL
SELECT id, 'Health', 49, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 49, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 49, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 49, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'B&R', 50, 'D', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 50, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'O&M', 50, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 50, 'D', FALSE FROM users WHERE phone_number = '9988550855'
UNION ALL
SELECT id, 'O&M', 50, 'D', TRUE FROM users WHERE phone_number = '7009670765'
UNION ALL
SELECT id, 'Health', 50, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 50, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 50, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 50, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'B&R', 51, 'D', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 51, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'O&M', 51, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 51, 'D', FALSE FROM users WHERE phone_number = '9988550855'
UNION ALL
SELECT id, 'O&M', 51, 'D', TRUE FROM users WHERE phone_number = '7009670765'
UNION ALL
SELECT id, 'Health', 51, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 51, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 51, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 51, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'B&R', 52, 'D', FALSE FROM users WHERE phone_number = '9888897201'
UNION ALL
SELECT id, 'B&R', 52, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'B&R', 52, 'D', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'O&M', 52, 'D', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 52, 'D', FALSE FROM users WHERE phone_number = '9988830795'
UNION ALL
SELECT id, 'O&M', 52, 'D', TRUE FROM users WHERE phone_number = '9878584763'
UNION ALL
SELECT id, 'Health', 52, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 52, 'D', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 52, 'D', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 52, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'Light', 52, 'D', TRUE FROM users WHERE phone_number = '9888663023'
UNION ALL
SELECT id, 'B&R', 53, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 53, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'B&R', 53, 'D', TRUE FROM users WHERE phone_number = '7837100158'
UNION ALL
SELECT id, 'O&M', 53, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 53, 'D', FALSE FROM users WHERE phone_number = '9988550855'
UNION ALL
SELECT id, 'O&M', 53, 'D', TRUE FROM users WHERE phone_number = '9988400532'
UNION ALL
SELECT id, 'Health', 53, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 53, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 53, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 53, 'D', FALSE FROM users WHERE phone_number = '9780801786'
UNION ALL
SELECT id, 'Light', 53, 'D', TRUE FROM users WHERE phone_number = '7837100158'
UNION ALL
SELECT id, 'B&R', 54, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 54, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 54, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'O&M', 54, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 54, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 54, 'D', TRUE FROM users WHERE phone_number = '8427134132'
UNION ALL
SELECT id, 'Health', 54, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 54, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 54, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 54, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 54, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'B&R', 55, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 55, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 55, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'O&M', 55, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 55, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 55, 'D', TRUE FROM users WHERE phone_number = '8427134132'
UNION ALL
SELECT id, 'Health', 55, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 55, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 55, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 55, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 55, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'B&R', 56, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 56, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 56, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'O&M', 56, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 56, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 56, 'D', TRUE FROM users WHERE phone_number = '9780024113'
UNION ALL
SELECT id, 'Health', 56, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 56, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 56, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 56, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 56, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'B&R', 57, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 57, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 57, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'O&M', 57, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 57, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 57, 'D', TRUE FROM users WHERE phone_number = '9780024113'
UNION ALL
SELECT id, 'Health', 57, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 57, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 57, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 57, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 57, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'B&R', 58, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 58, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 58, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'O&M', 58, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 58, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 58, 'D', TRUE FROM users WHERE phone_number = '9780024113'
UNION ALL
SELECT id, 'Health', 58, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 58, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 58, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 58, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 58, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'B&R', 59, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 59, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 59, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'O&M', 59, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 59, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 59, 'D', TRUE FROM users WHERE phone_number = '9780024113'
UNION ALL
SELECT id, 'Health', 59, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 59, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 59, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 59, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 59, 'D', TRUE FROM users WHERE phone_number = '9872354972'
UNION ALL
SELECT id, 'B&R', 60, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 60, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'B&R', 60, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 60, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 60, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 60, 'D', TRUE FROM users WHERE phone_number = '8427134132'
UNION ALL
SELECT id, 'Health', 60, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 60, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 60, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 60, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'Light', 60, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 61, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 61, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'B&R', 61, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 61, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 61, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 61, 'D', TRUE FROM users WHERE phone_number = '7814899197'
UNION ALL
SELECT id, 'Health', 61, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 61, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 61, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 61, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'Light', 61, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 62, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 62, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 62, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 62, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 62, 'D', FALSE FROM users WHERE phone_number = '9888933130'
UNION ALL
SELECT id, 'O&M', 62, 'D', TRUE FROM users WHERE phone_number = '7814899197'
UNION ALL
SELECT id, 'Health', 62, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 62, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 62, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 62, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 62, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 63, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 63, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 63, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 63, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 63, 'D', FALSE FROM users WHERE phone_number = '9888933130'
UNION ALL
SELECT id, 'O&M', 63, 'D', TRUE FROM users WHERE phone_number = '7814899197'
UNION ALL
SELECT id, 'Health', 63, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 63, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 63, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 63, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 63, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 64, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 64, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 64, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 64, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 64, 'D', FALSE FROM users WHERE phone_number = '9888933130'
UNION ALL
SELECT id, 'O&M', 64, 'D', TRUE FROM users WHERE phone_number = '7814899197'
UNION ALL
SELECT id, 'Health', 64, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 64, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 64, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 64, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 64, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 65, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 65, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'B&R', 65, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 65, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 65, 'D', FALSE FROM users WHERE phone_number = '9888933130'
UNION ALL
SELECT id, 'O&M', 65, 'D', TRUE FROM users WHERE phone_number = '7814899197'
UNION ALL
SELECT id, 'Health', 65, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 65, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 65, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 65, 'D', FALSE FROM users WHERE phone_number = '9780039813'
UNION ALL
SELECT id, 'Light', 65, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 66, 'D', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 66, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'B&R', 66, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 66, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 66, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 66, 'D', TRUE FROM users WHERE phone_number = '7888927362'
UNION ALL
SELECT id, 'Health', 66, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 66, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 66, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 66, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'Light', 66, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 67, 'D', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 67, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'B&R', 67, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 67, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 67, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 67, 'D', TRUE FROM users WHERE phone_number = '7888927362'
UNION ALL
SELECT id, 'Health', 67, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 67, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 67, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 67, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'Light', 67, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 68, 'D', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 68, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'B&R', 68, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 68, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 68, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 68, 'D', TRUE FROM users WHERE phone_number = '7888927362'
UNION ALL
SELECT id, 'Health', 68, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 68, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 68, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 68, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'Light', 68, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 69, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 69, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'B&R', 69, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 69, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 69, 'D', FALSE FROM users WHERE phone_number = '9888933130'
UNION ALL
SELECT id, 'O&M', 69, 'D', TRUE FROM users WHERE phone_number = '9781507993'
UNION ALL
SELECT id, 'Health', 69, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 69, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 69, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 69, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'Light', 69, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 70, 'D', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 70, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'B&R', 70, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 70, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 70, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 70, 'D', TRUE FROM users WHERE phone_number = '7888927362'
UNION ALL
SELECT id, 'Health', 70, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 70, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 70, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 70, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'Light', 70, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 71, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 71, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'B&R', 71, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 71, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 71, 'D', FALSE FROM users WHERE phone_number = '9888933130'
UNION ALL
SELECT id, 'O&M', 71, 'D', TRUE FROM users WHERE phone_number = '9781507993'
UNION ALL
SELECT id, 'Health', 71, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 71, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 71, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 71, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'Light', 71, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 72, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 72, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'B&R', 72, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 72, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 72, 'D', FALSE FROM users WHERE phone_number = '9780511500'
UNION ALL
SELECT id, 'O&M', 72, 'D', TRUE FROM users WHERE phone_number = '8427134132'
UNION ALL
SELECT id, 'Health', 72, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 72, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 72, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 72, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'Light', 72, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 73, 'D', FALSE FROM users WHERE phone_number = '9780039452'
UNION ALL
SELECT id, 'B&R', 73, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'B&R', 73, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'O&M', 73, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 73, 'D', FALSE FROM users WHERE phone_number = '9888933130'
UNION ALL
SELECT id, 'O&M', 73, 'D', TRUE FROM users WHERE phone_number = '9781507993'
UNION ALL
SELECT id, 'Health', 73, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 73, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 73, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 73, 'D', FALSE FROM users WHERE phone_number = '9814720996'
UNION ALL
SELECT id, 'Light', 73, 'D', TRUE FROM users WHERE phone_number = '7986605351'
UNION ALL
SELECT id, 'B&R', 74, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 74, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 74, 'B', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'O&M', 74, 'B', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 74, 'B', FALSE FROM users WHERE phone_number = '8146099950'
UNION ALL
SELECT id, 'O&M', 74, 'B', TRUE FROM users WHERE phone_number = '9988812321'
UNION ALL
SELECT id, 'Health', 74, 'B', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 74, 'B', FALSE FROM users WHERE phone_number = '9988797188'
UNION ALL
SELECT id, 'Health', 74, 'B', TRUE FROM users WHERE phone_number = '9780012331'
UNION ALL
SELECT id, 'Light', 74, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 74, 'B', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'B&R', 75, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 75, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 75, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'O&M', 75, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 75, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 75, 'B', TRUE FROM users WHERE phone_number = '8195019050'
UNION ALL
SELECT id, 'Health', 75, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 75, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 75, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 75, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 75, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'B&R', 76, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 76, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 76, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'O&M', 76, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 76, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 76, 'B', TRUE FROM users WHERE phone_number = '8195019050'
UNION ALL
SELECT id, 'Health', 76, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 76, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 76, 'B', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 76, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 76, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'B&R', 77, 'A', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 77, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 77, 'A', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'O&M', 77, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 77, 'A', FALSE FROM users WHERE phone_number = '9592999599'
UNION ALL
SELECT id, 'O&M', 77, 'A', TRUE FROM users WHERE phone_number = '8437229223'
UNION ALL
SELECT id, 'Health', 77, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 77, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 77, 'A', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 77, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 77, 'A', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'B&R', 78, 'A', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 78, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 78, 'A', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'O&M', 78, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 78, 'A', FALSE FROM users WHERE phone_number = '9592999599'
UNION ALL
SELECT id, 'O&M', 78, 'A', TRUE FROM users WHERE phone_number = '8437229223'
UNION ALL
SELECT id, 'Health', 78, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 78, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 78, 'A', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 78, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 78, 'A', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'B&R', 79, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 79, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 79, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'O&M', 79, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 79, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 79, 'B', TRUE FROM users WHERE phone_number = '8195019050'
UNION ALL
SELECT id, 'Health', 79, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 79, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 79, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 79, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 79, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'B&R', 80, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 80, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 80, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'O&M', 80, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 80, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 80, 'B', TRUE FROM users WHERE phone_number = '8195019050'
UNION ALL
SELECT id, 'Health', 80, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 80, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 80, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 80, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 80, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'B&R', 81, 'B', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 81, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 81, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'O&M', 81, 'B', FALSE FROM users WHERE phone_number = '9988850855'
UNION ALL
SELECT id, 'O&M', 81, 'B', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 81, 'B', TRUE FROM users WHERE phone_number = '8195019050'
UNION ALL
SELECT id, 'Health', 81, 'B', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 81, 'B', FALSE FROM users WHERE phone_number = '9780064002'
UNION ALL
SELECT id, 'Health', 81, 'B', TRUE FROM users WHERE phone_number = '9780112300'
UNION ALL
SELECT id, 'Light', 81, 'B', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 81, 'B', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'B&R', 82, 'A', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 82, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 82, 'A', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'O&M', 82, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 82, 'A', FALSE FROM users WHERE phone_number = '8146288822'
UNION ALL
SELECT id, 'O&M', 82, 'A', TRUE FROM users WHERE phone_number = '9815014886'
UNION ALL
SELECT id, 'Health', 82, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 82, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 82, 'A', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 82, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 82, 'A', TRUE FROM users WHERE phone_number = '8054030020'
UNION ALL
SELECT id, 'B&R', 83, 'A', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 83, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 83, 'A', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'O&M', 83, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 83, 'A', FALSE FROM users WHERE phone_number = '9592999599'
UNION ALL
SELECT id, 'O&M', 83, 'A', TRUE FROM users WHERE phone_number = '8437229223'
UNION ALL
SELECT id, 'Health', 83, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 83, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 83, 'A', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 83, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 83, 'A', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'B&R', 84, 'A', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 84, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 84, 'A', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'O&M', 84, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 84, 'A', FALSE FROM users WHERE phone_number = '9592999599'
UNION ALL
SELECT id, 'O&M', 84, 'A', TRUE FROM users WHERE phone_number = '9915271963'
UNION ALL
SELECT id, 'Health', 84, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 84, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 84, 'A', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 84, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 84, 'A', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'B&R', 85, 'A', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 85, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'B&R', 85, 'A', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'O&M', 85, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 85, 'A', FALSE FROM users WHERE phone_number = '9592999599'
UNION ALL
SELECT id, 'O&M', 85, 'A', TRUE FROM users WHERE phone_number = '9915271963'
UNION ALL
SELECT id, 'Health', 85, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 85, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 85, 'A', TRUE FROM users WHERE phone_number = '8591109999'
UNION ALL
SELECT id, 'Light', 85, 'A', FALSE FROM users WHERE phone_number = '7508243093'
UNION ALL
SELECT id, 'Light', 85, 'A', TRUE FROM users WHERE phone_number = '9988900126'
UNION ALL
SELECT id, 'B&R', 86, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 86, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 86, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 86, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 86, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 86, 'A', TRUE FROM users WHERE phone_number = '9217882000'
UNION ALL
SELECT id, 'Health', 86, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 86, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 86, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 86, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 86, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'B&R', 87, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 87, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 87, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 87, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 87, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 87, 'A', TRUE FROM users WHERE phone_number = '9217882000'
UNION ALL
SELECT id, 'Health', 87, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 87, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 87, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 87, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 87, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'B&R', 88, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 88, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 88, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 88, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 88, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 88, 'A', TRUE FROM users WHERE phone_number = '9217882000'
UNION ALL
SELECT id, 'Health', 88, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 88, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 88, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 88, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 88, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'B&R', 89, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 89, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 89, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 89, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 89, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 89, 'A', TRUE FROM users WHERE phone_number = '9023620049'
UNION ALL
SELECT id, 'Health', 89, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 89, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 89, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 89, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 89, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'B&R', 90, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 90, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 90, 'A', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'O&M', 90, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 90, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 90, 'A', TRUE FROM users WHERE phone_number = '8437229223'
UNION ALL
SELECT id, 'Health', 90, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 90, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 90, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 90, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 90, 'A', TRUE FROM users WHERE phone_number = '9815220788'
UNION ALL
SELECT id, 'B&R', 91, 'D', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 91, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'B&R', 91, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 91, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 91, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 91, 'D', TRUE FROM users WHERE phone_number = '7888927362'
UNION ALL
SELECT id, 'Health', 91, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 91, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 91, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 91, 'D', FALSE FROM users WHERE phone_number = '8847207893'
UNION ALL
SELECT id, 'Light', 91, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 92, 'D', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 92, 'D', FALSE FROM users WHERE phone_number = '8847207894'
UNION ALL
SELECT id, 'B&R', 92, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 92, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 92, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 92, 'D', TRUE FROM users WHERE phone_number = '7888927362'
UNION ALL
SELECT id, 'Health', 92, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 92, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 92, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 92, 'D', FALSE FROM users WHERE phone_number = '8847207894'
UNION ALL
SELECT id, 'Light', 92, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 93, 'D', FALSE FROM users WHERE phone_number = '9780039448'
UNION ALL
SELECT id, 'B&R', 93, 'D', FALSE FROM users WHERE phone_number = '8847207895'
UNION ALL
SELECT id, 'B&R', 93, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'O&M', 93, 'D', FALSE FROM users WHERE phone_number = '9814355554'
UNION ALL
SELECT id, 'O&M', 93, 'D', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 93, 'D', TRUE FROM users WHERE phone_number = '7888927362'
UNION ALL
SELECT id, 'Health', 93, 'D', FALSE FROM users WHERE phone_number = '9780011515'
UNION ALL
SELECT id, 'Health', 93, 'D', FALSE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Health', 93, 'D', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 93, 'D', FALSE FROM users WHERE phone_number = '8847207895'
UNION ALL
SELECT id, 'Light', 93, 'D', TRUE FROM users WHERE phone_number = '9988291286'
UNION ALL
SELECT id, 'B&R', 94, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 94, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 94, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 94, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 94, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 94, 'A', TRUE FROM users WHERE phone_number = '9023620049'
UNION ALL
SELECT id, 'Health', 94, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 94, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 94, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 94, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 94, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'B&R', 95, 'A', FALSE FROM users WHERE phone_number = '9888162620'
UNION ALL
SELECT id, 'B&R', 95, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'B&R', 95, 'A', TRUE FROM users WHERE phone_number = '9646222900'
UNION ALL
SELECT id, 'O&M', 95, 'A', FALSE FROM users WHERE phone_number = '9780221000'
UNION ALL
SELECT id, 'O&M', 95, 'A', FALSE FROM users WHERE phone_number = '9815144612'
UNION ALL
SELECT id, 'O&M', 95, 'A', TRUE FROM users WHERE phone_number = '9023620049'
UNION ALL
SELECT id, 'Health', 95, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 95, 'A', FALSE FROM users WHERE phone_number = '9876900475'
UNION ALL
SELECT id, 'Health', 95, 'A', TRUE FROM users WHERE phone_number = '9780019313'
UNION ALL
SELECT id, 'Light', 95, 'A', FALSE FROM users WHERE phone_number = '9041163066'
UNION ALL
SELECT id, 'Light', 95, 'A', TRUE FROM users WHERE phone_number = '9646222900';