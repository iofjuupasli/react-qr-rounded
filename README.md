# react-qr-rounded

React Component for QR code generation.

## Features:

- Rounded corners
- Cutout in the middle of the QR code for placing a logo or other image
- Rendered to SVG
- Responsive
- Custom colors
- TypeScript support
- Passing props to SVG element

## Available Props

| prop                   | type                         | required | default value |
|------------------------|------------------------------|----------|---------------|
| `children`             | `string`                     | yes      |               |
| `color`                | `string`                     |          | `'#000'`      |
| `backgroundColor`      | `string`                     |          |               |
| `cutout`               | `boolean`                    |          | `false`       |
| `cutoutElement`        | `ReactElement`               |          |               |
| `errorCorrectionLevel` | `string` (`'L' 'M' 'Q' 'H'`) |          | `'Q'`         |
| `rounding`             | `number` (`0` - `100`)       |          | `0`           |
| `...`                  | `SVGAttributes<SVGElement>`  |          |               |

## Examples:

### Minimal example:

```jsx
import ReactDOM from "react-dom";
import { QR } from "react-qr-rounded";

ReactDOM.render(
  <QR>https://iofjuupasli.github.io/react-qr-rounded/</QR>,
  document.getElementById("app")
);
```

### All props:

```jsx
<QR
  color="#000"
  backgroundColor="#fff"
  rounding={100}
  cutout
  cutoutElement={
    <img
      src="https://random.imagecdn.app/500/500"
      style={{
        objectFit: "contain",
        width: "100%",
        height: "100%",
      }}
    />
  }
  errorCorrectionLevel="H"
>
  https://www.fugo.ai/
</QR>
```

#### Result:

![_home_iofjuupasli_projects_react-qr-rounded_examples_index html](https://user-images.githubusercontent.com/1502968/179634306-aab34f21-24a9-48a6-9772-30e6fc84ca4d.png)

## LICENSE

[MIT](https://opensource.org/licenses/MIT)

The word 'QR Code' is registered trademark of DENSO WAVE INCORPORATED
<br/>http://www.denso-wave.com/qrcode/faqpatent-e.html
