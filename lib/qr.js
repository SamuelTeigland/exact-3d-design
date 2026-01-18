import QRCode from "qrcode";

export async function makeQrPngBuffer(url) {
    return QRCode.toBuffer(url, {
        type: "png",
        errorCorrectionLevel: "M",
        margin: 2,
        scale: 8,
    });
}

export async function makeQrSvgString(url) {
    return QRCode.toString(url, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 2,
    });
}