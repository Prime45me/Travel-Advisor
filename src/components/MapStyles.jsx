export default function MapStyles() {
  return (
    <style>{`
      .user-marker-red {
        position: relative;
        width: 20px;
        height: 20px;
      }
      .dot-red {
        width: 12px;
        height: 12px;
        background-color: #ff4d4d;
        border: 2px solid white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        box-shadow: 0 0 5px rgba(0,0,0,0.3);
      }
      .pulse-red {
        width: 20px;
        height: 20px;
        background-color: rgba(255, 77, 77, 0.4);
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 0;
        animation: pulse-red-animation 2s infinite;
        z-index: 1;
      }
      @keyframes pulse-red-animation {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
      }

      /* --- DROPPED PIN STYLES --- */
      .dropped-pin-wrapper {
        position: relative;
        width: 30px;
        height: 42px;
        animation: pin-drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .dropped-pin-marker {
        width: 26px;
        height: 36px;
        background: linear-gradient(135deg, #6c5ce7, #a855f7);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: absolute;
        top: 0;
        left: 2px;
        border: 2.5px solid white;
        box-shadow: 0 3px 12px rgba(108, 92, 231, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dropped-pin-head {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      }
      .dropped-pin-shadow {
        width: 14px;
        height: 4px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 50%;
        position: absolute;
        bottom: -2px;
        left: 8px;
        animation: pin-shadow 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      @keyframes pin-drop {
        0% { transform: translateY(-60px); opacity: 0; }
        60% { transform: translateY(4px); opacity: 1; }
        80% { transform: translateY(-8px); }
        100% { transform: translateY(0); }
      }
      @keyframes pin-shadow {
        0% { transform: scale(0.3); opacity: 0; }
        60% { transform: scale(1.2); opacity: 0.3; }
        100% { transform: scale(1); opacity: 0.2; }
      }
    `}</style>
  );
}
