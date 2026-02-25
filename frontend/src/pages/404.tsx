const lostWords = [
  { text: "lost", fill: "rgb(255,255,255)", fontSize: 60, x: 165, y: 210 },
  { text: "perdu", fill: "rgb(211,211,211)", fontSize: 14, x: 20, y: 40 },
  { text: "kadonnut", fill: "rgb(169,169,169)", fontSize: 18, x: 60, y: 74 },
  { text: "verloren", fill: "rgb(192,192,192)", fontSize: 24, x: 30, y: 380 },
  {
    text: "потерянный",
    fill: "rgb(128,128,128)",
    fontSize: 20,
    x: 288,
    y: 350,
  },
  { text: "失われた", fill: "rgb(105,105,105)", fontSize: 12, x: 220, y: 80 },
  { text: "สูญหาย", fill: "rgb(169,169,169)", fontSize: 8, x: 220, y: 320 },
  { text: "丢失", fill: "rgb(211,211,211)", fontSize: 22, x: 180, y: 143 },
  { text: "잃어버린", fill: "rgb(105,105,105)", fontSize: 10, x: 260, y: 270 },
  { text: "فقد", fill: "rgb(192,192,192)", fontSize: 16, x: 150, y: 30 },
  { text: "אבד", fill: "rgb(169,169,169)", fontSize: 18, x: 30, y: 230 },
  { text: "χαμένος", fill: "rgb(128,128,128)", fontSize: 20, x: 312, y: 180 },
  { text: "förlorade", fill: "rgb(105,105,105)", fontSize: 24, x: 40, y: 170 },
  { text: "tapt", fill: "rgb(192,192,192)", fontSize: 18, x: 140, y: 340 },
  { text: "tabt", fill: "rgb(128,128,128)", fontSize: 14, x: 310, y: 100 },
  { text: "galduta", fill: "rgb(211,211,211)", fontSize: 18, x: 330, y: 40 },
  { text: "elveszett", fill: "rgb(169,169,169)", fontSize: 12, x: 40, y: 90 },
  { text: "missed", fill: "rgb(192,192,192)", fontSize: 20, x: 80, y: 310 },
  { text: "изгубен", fill: "rgb(128,128,128)", fontSize: 10, x: 240, y: 370 },
  { text: "खो गया", fill: "rgb(105,105,105)", fontSize: 14, x: 130, y: 110 },
  {
    text: "शेर हो गया",
    fill: "rgb(169,169,169)",
    fontSize: 22,
    x: 240,
    y: 250,
  },
  { text: "stracony", fill: "rgb(211,211,211)", fontSize: 18, x: 80, y: 195 },
  { text: "borta", fill: "rgb(105,105,105)", fontSize: 10, x: 270, y: 220 },
  { text: "kayboldu", fill: "rgb(192,192,192)", fontSize: 16, x: 130, y: 50 },
  { text: "tévedt", fill: "rgb(169,169,169)", fontSize: 24, x: 80, y: 270 },
  { text: "vermisst", fill: "rgb(128,128,128)", fontSize: 20, x: 270, y: 150 },
  { text: "perdido", fill: "rgb(105,105,105)", fontSize: 24, x: 80, y: 130 },
  { text: "felizg", fill: "rgb(192,192,192)", fontSize: 10, x: 340, y: 290 },
  { text: "verloren", fill: "rgb(128,128,128)", fontSize: 14, x: 240, y: 130 },
];

const NotFoundSvg = () => (
  <svg id="svg404" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <style type="text/css">{`text { font-family: Arial, Helvetica, sans-serif; }`}</style>
    <rect height="100%" style={{ fill: "black" }} width="100%" />
    {lostWords.map((word) => (
      <text
        key={`${word.text}-${word.x}-${word.y}`}
        fill={word.fill}
        fontFamily="Arial"
        fontSize={String(word.fontSize)}
        x={String(word.x)}
        y={String(word.y)}
      >
        {word.text}
      </text>
    ))}
  </svg>
);

export const PageNotFound = () => {
  return (
    <>
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <html lang="en">
        <head>
          <title>404 - Not Found</title>
          <style>{`
            body {
              background-color: black;
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            #svg404 {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          `}</style>
        </head>
        <body>
          <NotFoundSvg />
        </body>
      </html>
    </>
  );
};
