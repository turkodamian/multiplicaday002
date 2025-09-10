import React from 'react';

interface DebugPanelProps {
  isVisible: boolean;
  state: {
    step: string;
    prompt: string;
    selectedAvatar: string | null;
    finalImageUrl: string | null;
    showKeyboard: boolean;
    cursorPosition: number;
    loadingProgress: number;
    loadingMessage: string;
    isPrinting: boolean;
    printingProgress: number;
    isSaving: boolean;
  };
  layout: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
    scale: number;
    orientation: string;
  };
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, state, layout }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '350px',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.95)',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '12px',
      padding: '16px',
      zIndex: 10000,
      overflowY: 'auto',
      backdropFilter: 'blur(10px)',
      borderLeft: '2px solid #00ff00'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #333'
      }}>
        <h3 style={{
          color: '#00ff00',
          margin: '0 0 8px 0',
          fontSize: '16px'
        }}>
          🐛 DEBUG PANEL
        </h3>
        <p style={{
          color: '#666',
          margin: 0,
          fontSize: '10px'
        }}>
          Press Ctrl+Alt+D to toggle
        </p>
      </div>

      {/* Current Step */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Current Step</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <span style={{
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {state.step.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation State */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Navigation</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <div>Step: <span style={{ color: '#00ff00' }}>{state.step}</span></div>
          <div>Can Navigate: <span style={{ color: state.step === 'loading' ? '#ff0000' : '#00ff00' }}>
            {state.step === 'loading' ? 'NO (loading)' : 'YES'}
          </span></div>
        </div>
      </div>

      {/* User Input */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>User Input</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <div>Prompt Length: <span style={{ color: '#00ff00' }}>{state.prompt.length}</span></div>
          <div>Avatar Selected: <span style={{ color: state.selectedAvatar ? '#00ff00' : '#ff0000' }}>
            {state.selectedAvatar || 'NONE'}
          </span></div>
          <div>Can Generate: <span style={{ 
            color: (state.prompt.trim() && state.selectedAvatar) ? '#00ff00' : '#ff0000' 
          }}>
            {(state.prompt.trim() && state.selectedAvatar) ? 'YES' : 'NO'}
          </span></div>
        </div>
      </div>

      {/* Layout Info */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Layout</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <div>Device: <span style={{ color: '#00ff00' }}>
            {layout.isMobile ? 'MOBILE' : layout.isTablet ? 'TABLET' : 'DESKTOP'}
          </span></div>
          <div>Size: <span style={{ color: '#00ff00' }}>{layout.width}x{layout.height}</span></div>
          <div>Scale: <span style={{ color: '#00ff00' }}>{layout.scale.toFixed(2)}</span></div>
          <div>Orientation: <span style={{ color: '#00ff00' }}>{layout.orientation.toUpperCase()}</span></div>
        </div>
      </div>

      {/* Loading State */}
      {(state.step === 'loading' || state.isPrinting || state.isSaving) && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Loading State</h4>
          <div style={{
            background: '#1a1a1a',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #333'
          }}>
            <div>Progress: <span style={{ color: '#00ff00' }}>{state.loadingProgress}%</span></div>
            <div>Message: <span style={{ color: '#ffff00' }}>{state.loadingMessage}</span></div>
            <div>Printing: <span style={{ color: state.isPrinting ? '#00ff00' : '#666' }}>
              {state.isPrinting ? 'YES' : 'NO'}
            </span></div>
            <div>Saving: <span style={{ color: state.isSaving ? '#00ff00' : '#666' }}>
              {state.isSaving ? 'YES' : 'NO'}
            </span></div>
          </div>
        </div>
      )}

      {/* Generated Image */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Generated Image</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <div>Has Image: <span style={{ color: state.finalImageUrl ? '#00ff00' : '#ff0000' }}>
            {state.finalImageUrl ? 'YES' : 'NO'}
          </span></div>
          {state.finalImageUrl && (
            <div>URL: <span style={{ 
              color: '#00ff00', 
              fontSize: '10px',
              wordBreak: 'break-all'
            }}>
              {state.finalImageUrl.substring(0, 40)}...
            </span></div>
          )}
        </div>
      </div>

      {/* Keyboard */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Virtual Keyboard</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <div>Visible: <span style={{ color: state.showKeyboard ? '#00ff00' : '#ff0000' }}>
            {state.showKeyboard ? 'YES' : 'NO'}
          </span></div>
          <div>Cursor Position: <span style={{ color: '#00ff00' }}>{state.cursorPosition}</span></div>
        </div>
      </div>

      {/* Current Prompt */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Current Prompt</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333',
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          <div style={{
            color: '#ffff00',
            fontSize: '11px',
            lineHeight: '1.3',
            wordBreak: 'break-word'
          }}>
            {state.prompt || '<empty>'}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>System Status</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <div>Timestamp: <span style={{ color: '#00ff00' }}>{new Date().toLocaleTimeString()}</span></div>
          <div>User Agent: <span style={{ 
            color: '#666', 
            fontSize: '10px',
            wordBreak: 'break-word'
          }}>
            {navigator.userAgent.substring(0, 30)}...
          </span></div>
        </div>
      </div>

      {/* Debug Actions */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#ff6600', margin: '0 0 8px 0' }}>Quick Actions</h4>
        <div style={{
          background: '#1a1a1a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '10px', color: '#666' }}>
            • Check step transitions<br/>
            • Verify button states<br/>
            • Monitor loading progress<br/>
            • Track user interactions
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;