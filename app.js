let finalCode = "";

async function convert() {

    const file = document.getElementById("file").files[0];

    if (!file) {
        alert("Seleziona un file DOCX");
        return;
    }

    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.convertToHtml({ arrayBuffer });

    let html = result.value;

    // placeholder {{campo}} → PHP TCPDF safe
    html = html.replace(/\{\{(.*?)\}\}/g, '".htmlspecialchars($$1)."');

    document.getElementById("preview").innerHTML = html;

    const header = "HEADER GENERATO DA WORD";
    const footerExpr = '" . $this->getAliasNumPage() . "/" . $this->getAliasNbPages() . "';

    finalCode = `<?php
require_once("tcpdf/tcpdf.php");

class MYPDF extends TCPDF {

    public function Header() {
        $this->SetFont("helvetica", "", 10);
        $this->writeHTML("${header}", true, false, true, false, "");
    }

    public function Footer() {
        $this->SetY(-15);
        $this->SetFont("helvetica", "I", 8);

        $this->Cell(0, 10,
            "Pagina " . ${footerExpr},
            0, false, "C"
        );
    }
}

$pdf = new MYPDF();

$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(true, 25);
$pdf->AddPage();

$html = \`${html.replace(/`/g, "\\`")}\`;

$pdf->writeHTML($html, true, false, true, false, "");

$pdf->Output();
?>`;

    document.getElementById("output").value = finalCode;
}

function download() {

    const blob = new Blob([finalCode], { type: "text/php" });
    saveAs(blob, "tcpdf_template.php");
}
