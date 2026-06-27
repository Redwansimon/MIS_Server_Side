const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { MIS_DBpoolPromise } = require('../../db'); // path ঠিক করো

router.get("/", async (req, res) => {
  try {
    const shop = req.query.shop || "ALL";
    const whereClause = shop === "ALL" ? "" : "WHERE STORE_NAME = @shop";

    const pool = await MIS_DBpoolPromise;
    const dataRequest = pool.request();
    if (shop !== "ALL") dataRequest.input("shop", shop);

    const result = await dataRequest.query(`
      SELECT * FROM MIS_DB.dbo.stockreports ${whereClause} ORDER BY BARCODE
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Report");

    sheet.addRow([
      "SL","BARCODE","CATEGORY","SUB CATEGORY","SUB SUBCATEGORY",
      "STYLE CODE","COLOR","SIZE","BRAND","SUPPLIER",
      "STORE","CPU","MRP","BAL QTY"
    ]);

    sheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6464B4" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    });

    result.recordset.forEach((row, i) => {
      const excelRow = sheet.addRow([
        i + 1, row.BARCODE, row.CATEGORY, row.SUB_CATEGORY,
        row.SUB_SUBCATEGORY, row.STYLE_CODE, row.COLOR, row.SIZE,
        row.BRAND, row.SUPNAME, row.STORE_NAME, row.CPU, row.MRP, row.BALQTY,
      ]);
       excelRow.getCell(1).numFmt = '0';
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=StockReport_${shop}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.log(err);
    res.status(500).send("Excel generation failed");
  }
});

module.exports = router;