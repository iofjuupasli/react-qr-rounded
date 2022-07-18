import * as React from "react";
import { ReactNode, SVGAttributes, useMemo } from "react";
import qrGenerator from "qrcode-generator";

const VIEWPORT_SIZE = 1000;

const RE_CODE_LENGTH_OVERFLOW = /code length overflow/i;

qrGenerator.stringToBytes = qrGenerator.stringToBytesFuncs["UTF-8"];

type QrType = {
  text: string;
  level: ErrorCorrectionLevel;
  version: number;
  moduleCount: number;
  isDark: (row: number, col: number) => boolean;
};

const createQrCode = (
  text: string,
  level: ErrorCorrectionLevel,
  minVer: number
): QrType | null => {
  minVer = Math.max(1, minVer);

  for (let version = minVer; version <= 40; version += 1) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qr = qrGenerator(version as any, level);
      qr.addData(text);
      qr.make();
      const moduleCount = qr.getModuleCount();
      const isDark = (row: number, col: number) => {
        return (
          row >= 0 &&
          row < moduleCount &&
          col >= 0 &&
          col < moduleCount &&
          qr.isDark(row, col)
        );
      };
      return { text, level, version, moduleCount, isDark };
    } catch (err) {
      if (!(version < 40 && RE_CODE_LENGTH_OVERFLOW.test(String(err)))) {
        throw err;
      }
    }
  }
  return null;
};

const round = Math.round;

const drawM = (x: number, y: number) => {
  return `M ${round(x)} ${round(y)}`;
};

const drawL = (x: number, y: number) => {
  return `L ${round(x)} ${round(y)}`;
};

const drawA = (x: number, y: number, rad: number) => {
  return `A ${round(rad)} ${round(rad)} 0 0 1 ${round(x)} ${round(y)}`;
};

const drawDark = (
  l: number,
  t: number,
  r: number,
  b: number,
  rad: number,
  nw: boolean,
  ne: boolean,
  se: boolean,
  sw: boolean
) => {
  const path: Array<string> = [];

  if (nw) {
    path.push(drawM(l + rad, t));
  } else {
    path.push(drawM(l, t));
  }

  if (ne) {
    path.push(drawL(r - rad, t), drawA(r, t + rad, rad));
  } else {
    path.push(drawL(r, t));
  }

  if (se) {
    path.push(drawL(r, b - rad), drawA(r - rad, b, rad));
  } else {
    path.push(drawL(r, b));
  }

  if (sw) {
    path.push(drawL(l + rad, b), drawA(l, b - rad, rad));
  } else {
    path.push(drawL(l, b));
  }

  if (nw) {
    path.push(drawL(l, t + rad), drawA(l + rad, t, rad));
  } else {
    path.push(drawL(l, t));
  }
  return path.join(" ");
};

const drawLight = (
  l: number,
  t: number,
  r: number,
  b: number,
  rad: number,
  nw: boolean,
  ne: boolean,
  se: boolean,
  sw: boolean
) => {
  const path: Array<string> = [];
  if (nw) {
    path.push(
      drawM(l + rad, t),
      drawL(l, t),
      drawL(l, t + rad),
      drawA(l + rad, t, rad)
    );
  }

  if (ne) {
    path.push(
      drawM(r, t + rad),
      drawL(r, t),
      drawL(r - rad, t),
      drawA(r, t + rad, rad)
    );
  }

  if (se) {
    path.push(
      drawM(r - rad, b),
      drawL(r, b),
      drawL(r, b - rad),
      drawA(r - rad, b, rad)
    );
  }

  if (sw) {
    path.push(
      drawM(l, b - rad),
      drawL(l, b),
      drawL(l + rad, b),
      drawA(l, b - rad, rad)
    );
  }

  return path.join(" ");
};

const drawMod = (
  qr: QrType,
  rounding: number,
  width: number,
  row: number,
  col: number
) => {
  const left = col * width;
  const top = row * width;
  const right = left + width;
  const bottom = top + width;
  const radius = rounding * 0.005 * width;

  const isDark = qr.isDark;
  const rowN = row - 1;
  const rowS = row + 1;
  const colW = col - 1;
  const colE = col + 1;
  const darkCenter = isDark(row, col);
  const darkNw = isDark(rowN, colW);
  const darkN = isDark(rowN, col);
  const darkNe = isDark(rowN, colE);
  const darkE = isDark(row, colE);
  const darkSe = isDark(rowS, colE);
  const darkS = isDark(rowS, col);
  const darkSw = isDark(rowS, colW);
  const darkW = isDark(row, colW);

  if (darkCenter) {
    return drawDark(
      left,
      top,
      right,
      bottom,
      radius,
      !darkN && !darkW,
      !darkN && !darkE,
      !darkS && !darkE,
      !darkS && !darkW
    );
  } else {
    return drawLight(
      left,
      top,
      right,
      bottom,
      radius,
      darkN && darkW && darkNw,
      darkN && darkE && darkNe,
      darkS && darkE && darkSe,
      darkS && darkW && darkSw
    );
  }
};

const createPath = (qr: QrType, rounding: number) => {
  if (!qr) {
    return "";
  }

  const modCount = qr.moduleCount;
  const modSize = VIEWPORT_SIZE / modCount;

  const path = [];
  for (let row = 0; row < modCount; row += 1) {
    for (let col = 0; col < modCount; col += 1) {
      path.push(drawMod(qr, rounding, modSize, row, col));
    }
  }

  return path.join(" ");
};

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export const QR = ({
  color = "#000",
  backgroundColor,
  cutout = false,
  cutoutElement,
  errorCorrectionLevel = "Q",
  rounding = 0,
  children,
  ...props
}: {
  /** The color of the QR code
   * @default "#000"
   * */
  color?: string;
  /** The background color of the QR code */
  backgroundColor?: string;
  /** Whether to cut out the middle for placing some content here (e.g. a logo) */
  cutout?: boolean;
  /** The element to place in the middle of the QR code */
  cutoutElement?: ReactNode;
  /** Raising this level improves error correction capability but also increases the amount of data QR Code size
   * The available levels are:
   * - L: 7%
   * - M: 15%
   * - Q: 25%
   * - H: 30%
   * @default "Q"
   * */
  errorCorrectionLevel?: ErrorCorrectionLevel;
  /** The amount of rounding to apply to the QR code elements from 0 to 100
   * @default 0
   * */
  rounding?: number;
  /** The QR code data */
  children: string;
} & SVGAttributes<SVGElement>) => {
  const qr = useMemo(
    () => createQrCode(children, errorCorrectionLevel, 1),
    [children, errorCorrectionLevel]
  );
  if (!qr) {
    return null;
  }
  const moduleCount = qr?.moduleCount ?? 1;
  const moduleSize = VIEWPORT_SIZE / (qr?.moduleCount ?? 1);
  const cutoutSize = moduleSize * (Math.floor(moduleCount * 0.18) * 2 - 1) + 2;
  const cutoutPosition = (VIEWPORT_SIZE - cutoutSize) / 2;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
      {...props}
    >
      {cutout ? (
        <mask id="react-qr-rounded__mask">
          <rect
            x="0"
            y="0"
            width={VIEWPORT_SIZE}
            height={VIEWPORT_SIZE}
            fill="#fff"
          />
          <rect
            x={cutoutPosition}
            y={cutoutPosition}
            width={cutoutSize}
            height={cutoutSize}
            rx={rounding}
            ry={rounding}
            fill="#000"
          />
        </mask>
      ) : null}
      {backgroundColor ? (
        <rect
          x="0"
          y="0"
          width={VIEWPORT_SIZE}
          height={VIEWPORT_SIZE}
          fill={backgroundColor}
        />
      ) : null}
      <path
        fill={color}
        d={createPath(qr, rounding)}
        mask={cutout ? "url(#react-qr-rounded__mask)" : undefined}
      />
      {cutoutElement ? (
        <foreignObject
          x={cutoutPosition}
          y={cutoutPosition}
          width={cutoutSize}
          height={cutoutSize}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
              overflow: "hidden",
              borderRadius: rounding,
            }}
          >
            {cutoutElement}
          </div>
        </foreignObject>
      ) : null}
    </svg>
  );
};
