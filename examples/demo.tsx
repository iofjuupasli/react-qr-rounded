import { QR, ErrorCorrectionLevel } from "..";
import React, { useState } from "react";
import ReactDOM from "react-dom";

const Demo = () => {
  const [value, setValue] = useState("");
  const [color, setColor] = useState("#000");
  const [backgroundColor, setBackgroundColor] = useState<string>();
  const [cutout, setCutout] = useState(false);
  const [withCutoutElement, setWithCutoutElement] = useState(false);
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("Q");
  const [rounding, setRounding] = useState(0);
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
        }}
      />
      <input
        type="color"
        value={backgroundColor}
        onChange={(e) => {
          setBackgroundColor(e.target.value);
        }}
      />
      <input
        type="checkbox"
        checked={cutout}
        onChange={() => {
          setCutout(!cutout);
        }}
      />
      <input
        type="checkbox"
        checked={withCutoutElement}
        onChange={() => {
          setWithCutoutElement(!withCutoutElement);
        }}
      />
      <select
        value={errorCorrectionLevel}
        onChange={(e) => {
          setErrorCorrectionLevel(e.target.value as ErrorCorrectionLevel);
        }}
      >
        <option value="L">L</option>
        <option value="M">M</option>
        <option value="Q">Q</option>
        <option value="H">H</option>
      </select>
      <input
        type="range"
        min={0}
        max={100}
        value={rounding}
        onChange={(e) => {
          setRounding(+e.target.value);
        }}
      />
      <QR
        color={color}
        backgroundColor={backgroundColor}
        rounding={rounding}
        cutout={cutout}
        cutoutElement={
          withCutoutElement ? (
            <img
              src="https://random.imagecdn.app/500/500"
              alt="Random image"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
              }}
            />
          ) : undefined
        }
        errorCorrectionLevel={errorCorrectionLevel}
      >
        {value}
      </QR>
    </div>
  );
};

ReactDOM.render(<Demo />, document.getElementById("demo"));
