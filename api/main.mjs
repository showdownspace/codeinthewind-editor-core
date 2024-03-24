export default async function main(req, res) {
  try {
    const tailwind = await fetch(
      "https://play.tailwindcss.com/FHzQWBQZtr?size=540x720"
    );
    if (!tailwind.ok) throw new Error("Failed to fetch Tailwind CSS");
    let code = await tailwind.text();
    code = code.replace(
      "</head",
      `<style>
        header > div:first-child {
          visibility: hidden;
        }
    </style></head`
    );
    code = code.replace("</body>", `<script src="/codeinthewind.js"></script>`);
    res.setHeader("Content-Type", "text/html");
    res.send(code);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to fetch Tailwind CSS");
  }
}
