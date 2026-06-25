async function generateBusinessId(req, sequenceName, prefix) {

        const tx = cds.tx(req);

        const result = await tx.run(
            `SELECT ${sequenceName}.NEXTVAL AS SEQ FROM DUMMY`
        );

        const seq = result[0].SEQ;

        return `${prefix}${String(seq).padStart(3, '0')}`;
    }
module.exports = { generateBusinessId };