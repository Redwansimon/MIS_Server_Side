const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { MIS_DBpoolPromise } = require('../../db'); // path ঠিক করো

router.get("/", async (req, res) => {
  try {
    const shop = req.query.shop || "ALL";
    const whereClause = shop === "ALL" ? "" : "WHERE STORE_NAME = @shop";

    const pool = await MIS_DBpoolPromise;
    const dataRequest = pool.request();
    if (shop !== "ALL") dataRequest.input("shop", shop);

    const result = await dataRequest.query(`
      SELECT * FROM MIS_DB.dbo.stockreports
      ${whereClause}
      ORDER BY BARCODE
    `);

    const rows = result.recordset;
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=StockReport_${shop}_${Date.now()}.pdf`);

    doc.pipe(res);

    doc.fontSize(14).text("MBRELLA", { align: "center" });
    doc.fontSize(8).text("HOUSE: 19, ROAD: 03, SECTOR: 03, UTTARA, DHAKA", { align: "center" });
    doc.fontSize(11).text("Shop Wise Stock Report", { align: "center" });
    doc.fontSize(9).text(`SHOP: ${shop === "ALL" ? "ALL SHOPS" : shop}`);
    doc.moveDown();

    const cols = [
      { label: "SL",          width: 25 },
      { label: "BARCODE",     width: 65 },
      { label: "CATEGORY",    width: 50 },
      { label: "SUB CAT",     width: 65 },
      { label: "SUB-SUB CAT", width: 65 },
      { label: "STYLE",       width: 70 },
      { label: "COLOR",       width: 55 },
      { label: "SIZE",        width: 30 },
      { label: "BRAND",       width: 45 },
      { label: "SUPPLIER",    width: 80 },
      { label: "STORE",       width: 60 },
      { label: "CPU",         width: 30 },
      { label: "MRP",         width: 30 },
      { label: "BAL QTY",     width: 35 },
    ];

    const startX = 20;
    const rowHeight = 15;
    const pageHeight = doc.page.height - 60;
    const totalWidth = cols.reduce((a, c) => a + c.width, 0);

    const drawHeader = (y) => {
      doc.rect(startX, y, totalWidth, rowHeight).fill("#6464b4");
      let x = startX;
      cols.forEach((col) => {
        doc.fontSize(7).fillColor("white").text(col.label, x + 2, y + 4, {
          width: col.width - 4, lineBreak: false,
        });
        x += col.width;
      });
      return y + rowHeight;
    };

    let currentY = drawHeader(doc.y);

    rows.forEach((row, i) => {
      if (currentY + rowHeight > pageHeight) {
        doc.addPage();
        currentY = drawHeader(30);
      }

      const values = [
        i + 1, row.BARCODE, row.CATEGORY, row.SUB_CATEGORY,
        row.SUB_SUBCATEGORY, row.STYLE_CODE, row.COLOR, row.SIZE,
        row.BRAND, row.SUPNAME, row.STORE_NAME, row.CPU, row.MRP, row.BALQTY,
      ];

      doc.rect(startX, currentY, totalWidth, rowHeight)
         .fill(i % 2 === 0 ? "#f5f5fa" : "#ffffff");

      let x = startX;
      doc.fontSize(6).fillColor("#000000");
      values.forEach((val, j) => {
        doc.text(String(val ?? ""), x + 2, currentY + 4, {
          width: cols[j].width - 4, lineBreak: false,
        });
        x += cols[j].width;
      });

      currentY += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.log(err);
    res.status(500).send("PDF generation failed");
  }
});

module.exports = router;