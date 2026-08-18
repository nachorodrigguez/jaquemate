import re

html_file = r'c:\Users\Nacho\Desktop\PROYECTOS\ja, que mate!\index.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    img_tag = match.group(1)
    
    src_match = re.search(r'src="([^"]+)"', img_tag)
    src = src_match.group(1) if src_match else 'images/placeholder.png'
    
    alt_match = re.search(r'alt="([^"]+)"', img_tag)
    alt = alt_match.group(1) if alt_match else 'Producto'

    replacement = f"""<div class="product-image carousel-container">
                    <div class="carousel-track">
                        <img src="{src}" alt="{alt} 1" class="carousel-slide">
                        <img src="{src}" alt="{alt} 2" class="carousel-slide">
                        <img src="{src}" alt="{alt} 3" class="carousel-slide">
                    </div>
                    <button class="carousel-btn prev" aria-label="Anterior"><i data-lucide="chevron-left"></i></button>
                    <button class="carousel-btn next" aria-label="Siguiente"><i data-lucide="chevron-right"></i></button>
                    <div class="carousel-indicators">
                        <span class="indicator active"></span>
                        <span class="indicator"></span>
                        <span class="indicator"></span>
                    </div>
                </div>"""
    return replacement

new_content = re.sub(r'<div class="product-image">\s*(<img[^>]+>)\s*</div>', replacer, content)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done')
