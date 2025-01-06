// Function definitions
// remover cvtcolor, 
// pasar rgb a bgr si hay gra=yscale y luego bgr to rgb 
// availableFunctions.push(
//     new ConfigFunction(
//         'cvtColor',
//         'CVT Color',
//         `https://docs.opencv.org/${LIBRARY_VERSION}/d8/d01/group__imgproc__color__conversions.html#ga397ae87e1288a81d2363b61574eb8cab`,
//         {
//             code: [
//                 'COLOR_BGR2RGB',
//                 'COLOR_RGB2BGR',
//                 'COLOR_BGR2BGRA',
//                 'COLOR_RGB2RGBA',
//                 'COLOR_BGR2GRAY',
//                 'COLOR_RGB2GRAY',
//                 'COLOR_GRAY2BGR',
//                 'COLOR_GRAY2RGB',
//                 'COLOR_BGR2XYZ',
//                 'COLOR_RGB2XYZ',
//                 'COLOR_XYZ2BGR',
//                 'COLOR_XYZ2RGB',
//                 'COLOR_BGR2YCrCb',
//                 'COLOR_RGB2YCrCb',
//                 'COLOR_YCrCb2BGR',
//                 'COLOR_YCrCb2RGB',
//                 'COLOR_BGR2HSV',
//                 'COLOR_RGB2HSV',
//                 'COLOR_BGR2Lab',
//                 'COLOR_RGB2Lab',
//                 'COLOR_BGR2Luv',
//                 'COLOR_RGB2Luv',
//                 'COLOR_BGR2HLS',
//                 'COLOR_RGB2HLS',
//                 'COLOR_HSV2BGR',
//                 'COLOR_HSV2RGB',
//                 'COLOR_Lab2BGR',
//                 'COLOR_Lab2RGB',
//                 'COLOR_Luv2BGR',
//                 'COLOR_Luv2RGB',
//                 'COLOR_HLS2BGR',
//                 'COLOR_HLS2RGB',
//                 'COLOR_BGR2YUV',
//                 'COLOR_RGB2YUV',
//                 'COLOR_YUV2BGR',
//                 'COLOR_YUV2RGB',
//                 'COLOR_COLORCVT_MAX'
//             ],
//             dstCn: {
//                 max: 4,
//                 min: 0,
//                 default: 0,
//                 step: 1
//             }
//         },
//         `cv.cvtColor(src=src, dst=dst, code=cv[params.code], dstCn=params.dstCn);`,
//         `
// dst = cv.cvtColor(src=src, code=cv.%code%, dstCn=%dstCn%)
// src = dst`));
availableFunctions.push(
    new ConfigFunction(
        'grayscale',
        'Grayscale',
        `https://docs.opencv.org/${LIBRARY_VERSION}/d8/d01/group__imgproc__color__conversions.html#ga397ae87e1288a81d2363b61574eb8cab`,
        './img/filters/64/base_grayscale.webp',
        {},
        `
cv.cvtColor(src, dst, code=cv['COLOR_RGB2GRAY']);
        `,
        `
dst = cv.cvtColor(src=src, code=cv.COLOR_BGR2GRAY)
src = dst`));

availableFunctions.push(new ConfigFunction(
    'threshold',
    'Threshold',
    `https://docs.opencv.org/${LIBRARY_VERSION}/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57`,
    './img/filters/64/base_threshold.webp',
    {
        thresh: 128,
        maxval: 255,
        type: [
            'THRESH_BINARY',
            'THRESH_BINARY_INV',
            'THRESH_TRUNC',
            'THRESH_TOZERO',
            'THRESH_TOZERO_INV'
        ]
    },
    `
cv.threshold(src=src, dst=dst, thresh=params.thresh, maxval=params.maxval, type=cv[params.type]);`,
    `
retval,dst = cv.threshold(src=src, thresh=%thresh%, maxval=%maxval%, type=cv.%type%)
src = dst`
));

availableFunctions.push(
    new ConfigFunction(
        'blur',
        'Blur',
        `https://docs.opencv.org/${LIBRARY_VERSION}/d4/d86/group__imgproc__filter.html#ga8c45db9afe636703801b0b2e440fce37`,
        './img/filters/64/base_blur.webp',
        {
            ksize: {
                min: 1,
                max: 21,
                step: 1,
                default: 5
            },
            borderType: [
                'BORDER_DEFAULT',
                'BORDER_CONSTANT',
                'BORDER_REPLICATE',
                'BORDER_REFLECT',
                'BORDER_WRAP',
                'BORDER_REFLECT_101',
                'BORDER_TRANSPARENT',
                'BORDER_REFLECT101',
                'BORDER_ISOLATED'
            ]
        },
        `
cv.blur(src=src, dst=dst, ksize=new cv.Size(params.ksize, params.ksize), new cv.Point(-1, -1), cv[params.borderType]);`,
        `
dst = cv.blur(src=src, ksize=(%ksize%, %ksize%), borderType=cv.%borderType%)
src = dst`,
        ''
    ));

availableFunctions.push(
    new ConfigFunction(
        'gaussianBlur',
        'Gaussian Blur',
        `https://docs.opencv.org/${LIBRARY_VERSION}/d4/d86/group__imgproc__filter.html#gaabe8c836e97159a9193fb0b11ac52cf1`,
        './img/filters/64/base_gaussian_blur.webp',
        {
            ksize: {
                min: 1,
                max: 21,
                step: 2,
                default: 5
            },
            sigmaX: 0,
            sigmaY: 0,
            borderType: [
                'BORDER_DEFAULT',
                'BORDER_CONSTANT',
                'BORDER_REPLICATE',
                'BORDER_REFLECT',
                'BORDER_WRAP',
                'BORDER_REFLECT_101',
                'BORDER_TRANSPARENT',
                'BORDER_REFLECT101',
                'BORDER_ISOLATED'
            ]
        },
        `
cv.GaussianBlur(src=src, dst=dst, ksize=new cv.Size(params.ksize, params.ksize), sigmaX=params.sigmaX, sigmaY=params.sigmaY, borderType=cv[params.borderType]);`,
        `
dst = cv.GaussianBlur(src=src, ksize=(%ksize%, %ksize%), sigmaX=%sigmaX%, sigmaY=%sigmaY%, borderType=%borderType%)
src = dst`,
        'Observations: kernel must be odd.'
    ));

availableFunctions.push(
    new ConfigFunction(
        'dilate',
        'Dilate',
        `https://docs.opencv.org/${LIBRARY_VERSION}/d4/d86/group__imgproc__filter.html#ga4ff0f3318642c4f469d0e11f242f3b6c`,
        './img/filters/64/base_dilate.webp',
        {
            ksize: {
                min: 1,
                max: 20,
                step: 1,
                default: 5
            },
            iterations: {
                min: 1,
                max: 100,
                step: 1,
                default: 1
            }
        },
        `
const kernelDilate = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(params.ksize, params.ksize));
cv.dilate(src, dst, kernelDilate, new cv.Point(-1, -1), params.iterations);
kernelDilate.delete();`,
        `
kernelDilate = cv.getStructuringElement(shape=cv.MORPH_RECT, ksize=(%ksize%, %ksize%))
dst = cv.dilate(src=src, kernel=kernelDilate, iterations=%iterations%)
src = dst`
    ));

availableFunctions.push(
    new ConfigFunction(
        'erode',
        'Erode',
        `https://docs.opencv.org/${LIBRARY_VERSION}/d4/d86/group__imgproc__filter.html#gaeb1e0c1033e3f6b891a25d0511362aeb`,
        './img/filters/64/base_erode.webp',
        {
            ksize: {
                min: 1,
                max: 20,
                step: 1,
                default: 5
            },
            iterations: {
                min: 1,
                max: 100,
                step: 1,
                default: 1
            }
        },
        `
const kernelErode = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(params.ksize, params.ksize));
cv.erode(src, dst, kernelErode, new cv.Point(-1, -1), params.iterations);
kernelErode.delete();`,
        `
kernelErode = cv.getStructuringElement(shape=cv.MORPH_RECT,  ksize=(%ksize%, %ksize%))
dst = cv.erode(src=src, kernel=kernelErode, iterations=%iterations%)
src = dst`
    ));

availableFunctions.push(
    new ConfigFunction(
        'canny',
        'Canny Edge Detection',
        `https://docs.opencv.org/${LIBRARY_VERSION}/dd/d1a/group__imgproc__feature.html#ga2a671611e104c093843d7b7fc46d24af`,
        './img/filters/64/base_canny_edge_detection.webp',
        {
            threshold1: 50,
            threshold2: 100,
            apertureSize: 3,
            L2gradient: [
                'False',
                'True']
        },
        `
cv.Canny(src, dst, params.threshold1, params.threshold2, params.apertureSize, convertBool(params.L2gradient));`,
        `
dst = cv.Canny(image=src, threshold1=%threshold1%, threshold2=%threshold2%, apertureSize=%apertureSize%, L2gradient=%L2gradient%)
src = dst`,
        '',
        [
            'grayscale'
        ]
    ));

availableFunctions.push(
    new ConfigFunction(
        'laplacian',
        'Laplacian',
        `https://docs.opencv.org/${LIBRARY_VERSION}/d4/d86/group__imgproc__filter.html#gad78703e4c8fe703d479c1860d76429e6`,
        './img/filters/64/base_laplacian.webp',
        {
            ksize: {
                min: 1,
                max: 21,
                step: 2,
                default: 9
            },
            scale: 127,
            delta: 127
        },
        `
cv.Laplacian(src, dst, cv.CV_8U, params.ksize, params.scale, params.delta);`,
`
dst = cv.Laplacian(src=src, ddepth=cv.CV_8U, ksize=%ksize%, scale=%scale%, delta=%delta%)
src = dst`,
'Observations: kernel must be odd.'
));

availableFunctions.push(
    new ConfigFunction(
        'findContours',
        'Find Contours',
        `https://docs.opencv.org/${LIBRARY_VERSION}/d3/dc0/group__imgproc__shape.html#gae4156f04053c44f886e387cff0ef6e08`,
        './img/filters/64/base_find_countours.webp',
        {},
        `
        let dstLocal = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0; i < contours.size(); ++i) {
            let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
    Math.round(Math.random() * 255));
    cv.drawContours(dstLocal, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
}
dst.delete();
dst = dstLocal.clone();
dstLocal.delete();
contours.delete();
hierarchy.delete();`,
        `
import math
import random
contours, hierarchy = cv.findContours(image=src.astype(np.uint8), mode=cv.RETR_CCOMP, method=cv.CHAIN_APPROX_SIMPLE)

dst = np.array(src ,dtype=np.uint8)
for idx in range(hierarchy.shape[1]):
    color = (round(random.random() * 255), round(random.random() * 255),
            round(random.random() * 255))
    cv2.drawContours(image=dst, contours=contours, contourIdx=idx, color=color,
                     thickness=cv2.FILLED, lineType=cv2.LINE_8, hierarchy=hierarchy)

src = dst`,
        'Observations: This function requires a binary matrix, so check if you have applied a grayscale and threshold.',
        [
            'grayscale',
            'threshold'
        ]
    ));


