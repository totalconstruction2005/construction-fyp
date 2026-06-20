import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type BreakdownNode = {
  name: string;
  amount: number;
  children?: BreakdownNode[];
};

type SummaryItem = {
  name: string;
  amount: number;
};

type EstimateResponse = {
  totalCost: number;
  ratePerSqFt: number;
  coveredArea: number;
  areaSqft: number;
  summary: SummaryItem[];
  breakdown: BreakdownNode[];
};

type PdfData = {
  estimate: EstimateResponse;
  region: string;
  areaSize: number;
  areaUnit: string;
  constructionType: string;
  constructionMode: string;
  coveredArea: number;
};

export const generateEstimatePdf = ({
  estimate,
  region,
  areaSize,
  areaUnit,
  constructionType,
  constructionMode,
}: PdfData) => {
  const doc = new jsPDF();

 const green: [number, number, number] = [
  5,
  150,
  105,
];

  const formatPKR = (value: number) =>
    `PKR ${Number(value).toLocaleString()}`;

  // =========================================
  // Header
  // =========================================

  doc.setFillColor(...green);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL CONSTRUCTION", 14, 18);

  doc.setFontSize(10);
  doc.text(
    "Professional Construction Cost Estimate Report",
    14,
    25
  );

  // =========================================
  // Report Details
  // =========================================

  doc.setTextColor(0, 0, 0);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  doc.text(
    "Construction Cost Estimate",
    14,
    42
  );

  doc.setFontSize(10);

  doc.text(
    `Generated On: ${new Date().toLocaleString()}`,
    14,
    50
  );

  doc.text(
    `Estimator URL: ${window.location.href}`,
    14,
    56
  );

  // =========================================
  // Property Information
  // =========================================

  autoTable(doc, {
    startY: 65,
    head: [["Property Information", "Value"]],
    body: [
      ["City", region],
      [
        "Area",
        `${areaSize} ${areaUnit}`,
      ],
      [
        "Construction Type",
        constructionType,
      ],
      [
        "Construction Mode",
        constructionMode,
      ],
      [
        "Covered Area",
        `${estimate.coveredArea.toLocaleString()} Sq Ft`,
      ],
    ],
    headStyles: {
      fillColor: green,
    },
  });

  // =========================================
  // Summary
  // =========================================

  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable.finalY + 10,
    head: [["Estimate Summary", "Amount"]],
    body: [
      ...estimate.summary.map((item) => [
        item.name,
        formatPKR(item.amount),
      ]),
      [
        "TOTAL COST",
        formatPKR(
          estimate.totalCost
        ),
      ],
    ],
    headStyles: {
      fillColor: green,
    },
  });

  // =========================================
  // Breakdown
  // =========================================

  const breakdownRows: string[][] = [];

  const flattenBreakdown = (
    nodes: BreakdownNode[],
    prefix = ""
  ) => {
    nodes.forEach((node) => {
      breakdownRows.push([
        `${prefix}${node.name}`,
        formatPKR(node.amount),
      ]);

      if (
        node.children &&
        node.children.length
      ) {
        flattenBreakdown(
          node.children,
          "   ↳ "
        );
      }
    });
  };

  flattenBreakdown(
    estimate.breakdown
  );

  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable.finalY + 10,
    head: [
      [
        "Detailed Cost Breakdown",
        "Amount",
      ],
    ],
    body: breakdownRows,
    headStyles: {
      fillColor: green,
    },
  });

  // =========================================
  // Footer
  // =========================================

  const footerY = 270;

  doc.setDrawColor(220);
  doc.line(
    14,
    footerY - 5,
    196,
    footerY - 5
  );

  doc.setFontSize(9);

  doc.text(
    "This estimate is generated automatically based on configured rates and breakdown percentages.",
    14,
    footerY
  );

  doc.text(
    "Actual construction costs may vary depending on market conditions, materials and project scope.",
    14,
    footerY + 5
  );

  doc.text(
    "© Total Construction",
    14,
    footerY + 12
  );

  doc.save(
    `Construction_Estimate_${region}.pdf`
  );
};