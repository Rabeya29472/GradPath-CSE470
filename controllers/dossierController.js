const dossierModel = require('../models/dossierModel');

function getDossier(req, res) {
    try {
        res.json({ success: true, dossier: dossierModel.getDossier(req.params.studentId) });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Could not load employability dossier.' });
    }
}

function exportDossier(req, res) {
    try {
        const dossier = dossierModel.getDossier(req.params.studentId);
        const pdf = dossierModel.buildPdf(dossier);
        const safeName = dossier.studentName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'student';
        res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${safeName}-employability-dossier.pdf"` });
        res.send(pdf);
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Could not export employability dossier.' });
    }
}

module.exports = { getDossier, exportDossier };
