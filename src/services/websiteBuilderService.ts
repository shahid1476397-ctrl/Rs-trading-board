// Autonomous Website & Project Builder Engine for Archer AI
import { memory, BuiltProject } from './memoryService';

export class WebsiteBuilderService {
  /**
   * Generates or modifies a website project based on user requirements
   */
  public generateWebsite(prompt: string, existingProject?: BuiltProject): BuiltProject {
    const isModification = !!existingProject;
    const lower = prompt.toLowerCase();

    let title = existingProject?.name || 'Modern Web Project';
    if (lower.includes('portfolio')) title = 'Personal Portfolio';
    else if (lower.includes('restaurant') || lower.includes('food')) title = 'Gourmet Bistro';
    else if (lower.includes('fitness') || lower.includes('gym')) title = 'Apex Fitness';
    else if (lower.includes('calculator')) title = 'Smart Calculator Pro';
    else if (lower.includes('crypto') || lower.includes('bitcoin')) title = 'CryptoMatrix Terminal';
    else if (lower.includes('e-commerce') || lower.includes('store') || lower.includes('shop')) title = 'NovaStore Online';

    // Generate responsive HTML/CSS/JS
    let htmlCode = '';

    if (lower.includes('calculator')) {
      htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #090a0f; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
    .calc-card { background: #12141f; border: 1px solid #1f2338; border-radius: 24px; padding: 1.5rem; width: 100%; max-width: 320px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
    .display { background: #05060a; border: 1px solid #232742; border-radius: 16px; padding: 1.2rem; font-size: 2rem; text-align: right; color: #00f3ff; margin-bottom: 1.2rem; overflow-x: auto; min-height: 70px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; }
    button { background: #1c2033; border: 1px solid #2d3352; color: #fff; border-radius: 14px; padding: 1rem 0; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
    button:hover { background: #2b314d; transform: scale(1.05); }
    button.op { background: #ff9e00; color: #000; border-color: #ff9e00; }
    button.eq { background: #00f3ff; color: #000; border-color: #00f3ff; grid-column: span 2; }
    button.clear { background: #f43f5e; color: #fff; border-color: #f43f5e; }
  </style>
</head>
<body>
  <div class="calc-card">
    <div class="display" id="disp">0</div>
    <div class="grid">
      <button class="clear" onclick="clr()">C</button>
      <button onclick="press('/')">/</button>
      <button onclick="press('*')">×</button>
      <button onclick="del()">←</button>
      <button onclick="press('7')">7</button>
      <button onclick="press('8')">8</button>
      <button onclick="press('9')">9</button>
      <button class="op" onclick="press('-')">-</button>
      <button onclick="press('4')">4</button>
      <button onclick="press('5')">5</button>
      <button onclick="press('6')">6</button>
      <button class="op" onclick="press('+')">+</button>
      <button onclick="press('1')">1</button>
      <button onclick="press('2')">2</button>
      <button onclick="press('3')">3</button>
      <button onclick="press('.')">.</button>
      <button onclick="press('0')">0</button>
      <button class="eq" onclick="calc()">=</button>
    </div>
  </div>
  <script>
    let d = document.getElementById('disp');
    function press(v) { if (d.innerText === '0') d.innerText = v; else d.innerText += v; }
    function clr() { d.innerText = '0'; }
    function del() { d.innerText = d.innerText.slice(0,-1) || '0'; }
    function calc() { try { d.innerText = eval(d.innerText.replace('×','*')); } catch { d.innerText = 'Error'; } }
  </script>
</body>
</html>`;
    } else {
      // Default / Full Responsive Landing Page / Website
      const primaryColor = lower.includes('green') ? '#10b981' : lower.includes('orange') || lower.includes('amber') ? '#ff9e00' : lower.includes('purple') ? '#b5179e' : '#00f3ff';
      const secondaryColor = lower.includes('gold') ? '#f59e0b' : '#3b82f6';

      htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Built by Archer AI</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #08090d; color: #f1f5f9; line-height: 1.6; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(8,9,13,0.8); backdrop-filter: blur(12px); position: sticky; top:0; z-index: 100; }
    .logo { font-size: 1.4rem; font-weight: 800; background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { min-height: 75vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 3rem 1.5rem; }
    .badge { background: rgba(0, 243, 255, 0.1); border: 1px solid ${primaryColor}; color: ${primaryColor}; padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 3rem; font-weight: 800; max-width: 800px; margin-bottom: 1.2rem; line-height: 1.2; }
    p.lead { font-size: 1.2rem; color: #94a3b8; max-width: 600px; margin-bottom: 2rem; }
    .btn-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 0.9rem 2rem; font-size: 1rem; font-weight: 700; border-radius: 50px; border: none; cursor: pointer; transition: 0.3s; text-decoration: none; }
    .btn-pri { background: ${primaryColor}; color: #000; box-shadow: 0 10px 25px rgba(0,243,255,0.3); }
    .btn-pri:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(0,243,255,0.5); }
    .btn-sec { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; }
    .btn-sec:hover { background: rgba(255,255,255,0.05); }
    .cards-section { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: #11131a; border: 1px solid rgba(255,255,255,0.06); padding: 2rem; border-radius: 20px; transition: 0.3s; }
    .card:hover { transform: translateY(-5px); border-color: ${primaryColor}; box-shadow: 0 15px 30px rgba(0,0,0,0.6); }
    .card h3 { font-size: 1.3rem; margin-bottom: 0.8rem; color: #fff; }
    .card p { color: #94a3b8; font-size: 0.95rem; }
    footer { text-align: center; padding: 2rem; border-top: 1px solid rgba(255,255,255,0.08); color: #64748b; font-size: 0.9rem; }
  </style>
</head>
<body>
  <nav>
    <div class="logo">${title}</div>
    <button class="btn btn-pri" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;" onclick="alert('Contact Form Initialized!')">Contact Us</button>
  </nav>

  <div class="hero">
    <div class="badge">Engineered with Archer AI</div>
    <h1>Build Future-Ready Web Experiences</h1>
    <p class="lead">An ultra-modern, fully responsive digital platform designed and created directly through conversational intelligence.</p>
    <div class="btn-row">
      <button class="btn btn-pri" onclick="alert('Action completed!')">Get Started</button>
      <button class="btn btn-sec" onclick="alert('Live preview active!')">Learn More</button>
    </div>
  </div>

  <div class="cards-section">
    <div class="card">
      <h3>🚀 Ultra Fast</h3>
      <p>Clean semantic structure optimized for speed, SEO, and flawless mobile experience.</p>
    </div>
    <div class="card">
      <h3>🎨 Custom Styled</h3>
      <p>Designed with modern dark aesthetics, responsive flex/grid layouts, and glow accents.</p>
    </div>
    <div class="card">
      <h3>⚡ Interactive Code</h3>
      <p>Ready for production with client-side events, clean DOM hooks, and custom triggers.</p>
    </div>
  </div>

  <footer>
    <p>© ${new Date().getFullYear()} ${title} • Built & Maintained by Archer AI</p>
  </footer>
</body>
</html>`;
    }

    const saved = memory.saveProject({
      id: existingProject?.id,
      name: title,
      type: lower.includes('calculator') ? 'app' : 'website',
      description: prompt,
      htmlCode,
    });

    return saved;
  }
}

export const websiteBuilder = new WebsiteBuilderService();
