import sys, asyncio
from playwright.async_api import async_playwright
pages=sys.argv[1:]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':1440,'height':900})
        await ctx.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        for pg in pages:
            w=390 if pg.endswith('@m') else 1440
            path=pg.replace('@m','')
            page=await ctx.new_page(); await page.set_viewport_size({'width':w,'height':900})
            await page.goto('file:///home/claude/ka/site/'+path)
            await page.add_style_tag(content='.reveal{opacity:1!important;transform:none!important}')
            await page.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
            await page.wait_for_timeout(800)
            out='/home/claude/ka/shots/'+path.replace('/','_')+('_m' if w<500 else '')+'.jpg'
            await page.screenshot(path=out, full_page=True, type='jpeg', quality=55)
            print(out)
        await b.close()
asyncio.run(main())
