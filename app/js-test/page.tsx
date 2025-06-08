export default function JSTest() {
  return (
    <html>
      <head>
        <title>JS Test</title>
      </head>
      <body>
        <h1>JavaScript Runtime Test</h1>
        <div id="result">Initial content</div>
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('🟢 Inline script executed');
            document.getElementById('result').innerHTML = '✅ JavaScript is working!';
            
            // Test if React is available
            if (typeof React !== 'undefined') {
              console.log('🟢 React is available');
            } else {
              console.log('❌ React is NOT available');
            }
            
            // Test if Next.js hydration happens
            window.addEventListener('load', function() {
              console.log('🟢 Window loaded');
              setTimeout(function() {
                console.log('🟢 Checking for hydration after 2 seconds...');
                document.getElementById('result').innerHTML += '<br/>✅ Window loaded, checking hydration...';
              }, 2000);
            });
          `
        }} />
      </body>
    </html>
  );
}