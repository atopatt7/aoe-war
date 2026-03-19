// ============================================================
// Phaser 3 型別宣告（此版本不包含官方 .d.ts，以命名空間宣告）
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace Phaser {
  class Game {
    constructor(config: any);
    destroy(removeCanvas: boolean): void;
  }
  class Scene {
    constructor(config?: any);
    add: any;
    cameras: any;
    input: any;
    load: any;
    scene: any;
    time: any;
    tweens: any;
    physics: any;
    sys: any;
    events: any;
    make: any;
    children: any;
  }
  namespace GameObjects {
    class Container {
      constructor(scene: any, x?: number, y?: number, children?: any[]);
      add(child: any): this;
      destroy(): void;
      setDepth(depth: number): this;
      setScale(x: number, y?: number): this;
      [key: string]: any;
    }
    class Graphics { [key: string]: any; }
    class Rectangle { [key: string]: any; }
    class Text { [key: string]: any; }
    class Image { [key: string]: any; }
    class Sprite { [key: string]: any; }
    class GameObject { [key: string]: any; }
  }
  namespace Input {
    namespace Keyboard {
      enum KeyCodes {
        ESC = 27,
        Q = 81, W = 87, E = 69, R = 82,
      }
    }
  }
  const AUTO: number;
}

declare module 'phaser' {
  export = Phaser;
}
