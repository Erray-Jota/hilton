import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import studioImg from "@assets/STUDIO_1761778234023.png";
import oneBedJrImg from "@assets/1BDJR_1761778234023.png";
import oneBedImg from "@assets/1BD_1761778234023.png";
import twoBedAImg from "@assets/2BDA_1761778234022.png";
import twoBedBImg from "@assets/2BDB_1761778234022.png";

export default function FloorPlanTable() {
  const unitImages: Record<string, string> = {
    'STUDIO': studioImg,
    '1BDJR': oneBedJrImg,
    '1BD': oneBedImg,
    '2BDA': twoBedAImg,
    '2BDB': twoBedBImg,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Building B - HTML Table Layout</CardTitle>
        <div className="text-sm text-gray-600">
          236'-0" × 56'-0" | Using HTML table for guaranteed alignment
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table 
            className="border-4 border-black" 
            style={{ 
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              width: '1880px' // 8px per foot × 235 feet
            }}
          >
            <colgroup>
              <col style={{ width: '224px' }} /> {/* Bay 1: 28' */}
              <col style={{ width: '80px' }} />  {/* Bay 2: 10' */}
              <col style={{ width: '124px' }} /> {/* Bay 3: 15.5' */}
              <col style={{ width: '216px' }} /> {/* Bay 4: 27' */}
              <col style={{ width: '480px' }} /> {/* Bay 5: 60' (Common) */}
              <col style={{ width: '320px' }} /> {/* Bay 6: 40' */}
              <col style={{ width: '216px' }} /> {/* Bay 7: 27' */}
              <col style={{ width: '224px' }} /> {/* Bay 8: 28' */}
            </colgroup>
            
            {/* North Row */}
            <tr style={{ height: '140px' }}>
              <td className="border-2 border-black p-0">
                <img src={unitImages['2BDA']} alt="2-BED TYPE A" className="w-full h-full object-cover" />
              </td>
              <td className="border-2 border-black bg-gray-200 text-center text-xs font-bold">
                STAIR
              </td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['STUDIO']} alt="STUDIO" className="w-full h-full object-cover" />
              </td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['1BD']} alt="1-BED" className="w-full h-full object-cover" />
              </td>
              <td rowSpan={3} className="border-4 border-black bg-yellow-200 text-center font-bold align-middle">
                COMMON AREA<br />
                <span className="text-sm font-normal">60' × 13'</span>
              </td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['2BDB']} alt="2-BED TYPE B" className="w-full h-full object-cover" />
              </td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['1BD']} alt="1-BED" className="w-full h-full object-cover" />
              </td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['2BDA']} alt="2-BED TYPE A" className="w-full h-full object-cover" />
              </td>
            </tr>
            
            {/* Corridor Row */}
            <tr style={{ height: '16px' }}>
              <td className="border-t-2 border-b-2 border-black bg-white"></td>
              <td className="border-t-2 border-b-2 border-black bg-white"></td>
              <td className="border-t-2 border-b-2 border-black bg-white"></td>
              <td className="border-t-2 border-b-2 border-black bg-white"></td>
              {/* Common area spans this row */}
              <td className="border-t-2 border-b-2 border-black bg-white"></td>
              <td className="border-t-2 border-b-2 border-black bg-white"></td>
              <td className="border-t-2 border-b-2 border-black bg-white"></td>
            </tr>
            
            {/* South Row */}
            <tr style={{ height: '140px' }}>
              <td className="border-2 border-black bg-white"></td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['1BDJR']} alt="1-BD JR" className="w-full h-full object-cover" />
              </td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['STUDIO']} alt="STUDIO" className="w-full h-full object-cover" />
              </td>
              <td className="border-2 border-black p-0">
                <img src={unitImages['1BDJR']} alt="1-BD JR" className="w-full h-full object-cover" />
              </td>
              {/* Common area spans this row */}
              <td className="border-2 border-black p-0">
                <img src={unitImages['1BDJR']} alt="1-BD JR" className="w-full h-full object-cover" />
              </td>
              <td className="border-2 border-black bg-white"></td>
              <td className="border-2 border-black bg-gray-200 text-center text-xs font-bold">
                STAIR
              </td>
            </tr>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <strong>Why tables work:</strong> HTML tables guarantee vertical alignment because all cells in the same column share the exact same width. The browser calculates column widths once for the entire table, not separately per row.
        </div>
      </CardContent>
    </Card>
  );
}
