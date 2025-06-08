'use client';

export default function MinimalTest() {
  console.log('🔵 MinimalTest: Component executing');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Bare Minimum Test</h1>
      <p>If you see this, React server rendering works.</p>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          console.log('🔵 Inline script: Executing');
          window.testWorking = true;
          
          // Test basic DOM manipulation
          setTimeout(function() {
            console.log('🔵 Inline script: Timeout executing');
            const el = document.getElementById('status');
            if (el) {
              el.innerHTML = '✅ JavaScript executed successfully!';
              el.style.color = 'green';
            }
          }, 100);
        `
      }} />
      
      <div id="status" style={{color: 'red', fontWeight: 'bold', padding: '10px', backgroundColor: '#f0f0f0'}}>
        ❌ JavaScript not executed yet
      </div>
      
      <div style={{marginTop: '20px'}}>
        <p><strong>Expected behavior:</strong></p>
        <ol>
          <li>Red text should turn green</li>
          <li>Message should change to &quot;JavaScript executed successfully!&quot;</li>
          <li>Console should show log messages</li>
        </ol>
      </div>
    </div>
  );
}