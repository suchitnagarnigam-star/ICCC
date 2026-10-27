import zipfile
import xml.etree.ElementTree as ET
import json
import sys
from datetime import datetime, timedelta

def parse_excel_date(val):
    if not val:
        return datetime.now().isoformat() + 'Z'
    try:
        serial = float(val)
        # Excel epoch offset (1899-12-30)
        dt = datetime(1899, 12, 30) + timedelta(days=serial)
        return dt.isoformat() + 'Z'
    except Exception:
        return datetime.now().isoformat() + 'Z'

def clean_phone(val):
    if not val:
        return ''
    try:
        f = float(val)
        s = str(int(f))
        return s[-10:] if len(s) >= 10 else s
    except Exception:
        digits = ''.join(filter(str.isdigit, str(val)))
        return digits[-10:] if len(digits) >= 10 else digits

def main():
    excel_path = sys.argv[1] if len(sys.argv) > 1 else 'MCL Control Room ICCC.xlsx'
    
    with zipfile.ZipFile(excel_path) as z:
        sst_xml = z.read('xl/sharedStrings.xml')
        sst_root = ET.fromstring(sst_xml)
        sst = [elem.text or '' for elem in sst_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
        
        sheet_xml = z.read('xl/worksheets/sheet1.xml')
        sheet_root = ET.fromstring(sheet_xml)
        
        records = []
        
        for row in sheet_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')[1:]:
            cells = {}
            for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                col_letter = ''.join(filter(str.isalpha, c.attrib.get('r', '')))
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = v.text if v is not None else ''
                if c.attrib.get('t') == 's' and val:
                    val = sst[int(val)]
                cells[col_letter] = str(val or '').strip()
                
            comp_num = cells.get('A', '')
            name = cells.get('I', '')
            desc = cells.get('M', '')
            contact = cells.get('J', '')
            
            # Skip empty template rows
            if not comp_num or not (name or desc or contact):
                continue
                
            try:
                seq_id = int(float(comp_num))
            except Exception:
                continue
                
            ward_raw = cells.get('C', '')
            ward_num = None
            try:
                if ward_raw:
                    ward_num = int(float(ward_raw))
            except Exception:
                pass
                
            branch_raw = cells.get('G', '').strip()
            if branch_raw not in ['B&R', 'O&M', 'Health', 'Light']:
                branch_raw = 'O&M'
                
            status_raw = cells.get('V', '').strip()
            status = 'CLOSED' if status_raw.lower() == 'closed' else 'ASSIGNED'

            mode_val = cells.get('H', '').strip() or '24/7 Hotline'
            addr_val = cells.get('K', '').strip()
            if len(mode_val) > 30:
                addr_val = f"{mode_val}, {addr_val}".strip(', ')
                mode_val = '24/7 Hotline'
            
            record = {
                'sourceId': f'EXCEL-{seq_id:04d}',
                'sequenceNumber': seq_id,
                'submittedAt': parse_excel_date(cells.get('B', '')),
                'wardNumber': ward_num,
                'zone': cells.get('D', '').strip() or None,
                'categoryRaw': cells.get('F', '').strip(),
                'branch': branch_raw,
                'mode': mode_val,
                'complainantName': name or 'Citizen',
                'contactNumber': clean_phone(contact) or '9999999999',
                'address': addr_val or None,
                'landmark': cells.get('L', '').strip() or None,
                'description': desc or f"Historical civic grievance registered in {branch_raw} department.",
                'assignedOfficerRaw': cells.get('R', '').strip() or None,
                'status': status,
                'remarks': cells.get('Y', '').strip() or None,
                'resolution': cells.get('Z', '').strip() or None,
            }
            records.append(record)
            
        print(json.dumps(records, indent=2))

if __name__ == '__main__':
    main()

