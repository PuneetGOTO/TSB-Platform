// 解决React和React相关库的类型声明
declare module 'react' {
  export * from 'react/index';
}

declare module 'react/jsx-runtime' {
  export * from 'react/jsx-runtime/index';
}

// 解决Three.js相关库的类型声明
declare module 'three' {
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
  }
  
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiply(v: Vector3): this;
    multiplyScalar(s: number): this;
    normalize(): this;
    clone(): Vector3;
    copy(v: Vector3): this;
    length(): number;
    distanceTo(v: Vector3): number;
  }
  
  export class Mesh {
    constructor(geometry?: BufferGeometry, material?: Material | Material[]);
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    material: Material | Material[];
    geometry: BufferGeometry;
    visible: boolean;
  }
  
  export class BufferGeometry {
    constructor();
    setAttribute(name: string, attribute: BufferAttribute): this;
    computeVertexNormals(): void;
    computeBoundingSphere(): void;
  }
  
  export class BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number, normalized?: boolean);
    count: number;
    itemSize: number;
  }
  
  export class Color {
    constructor(color?: string | number);
    r: number;
    g: number;
    b: number;
    set(color: string | number): this;
  }
  
  export class Material {
    constructor();
    visible: boolean;
    transparent: boolean;
    opacity: number;
    side: number;
    needsUpdate: boolean;
  }
  
  export class MeshBasicMaterial extends Material {
    constructor(parameters?: { color?: Color | string | number; wireframe?: boolean; map?: Texture; transparent?: boolean; opacity?: number });
    color: Color;
    wireframe: boolean;
    map: Texture | null;
  }
  
  export class MeshStandardMaterial extends Material {
    constructor(parameters?: { color?: Color | string | number; roughness?: number; metalness?: number; map?: Texture });
    color: Color;
    roughness: number;
    metalness: number;
    map: Texture | null;
  }
  
  export class Texture {
    constructor(image?: HTMLImageElement | HTMLCanvasElement);
    image: HTMLImageElement | HTMLCanvasElement;
    needsUpdate: boolean;
  }
  
  export class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number, order?: string): this;
  }

  export class Group extends Object3D {}
  
  export class Object3D {
    constructor();
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    children: Object3D[];
    parent: Object3D | null;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    lookAt(target: Vector3 | Object3D): this;
    updateMatrix(): void;
    updateMatrixWorld(force?: boolean): void;
  }
  
  export class Points extends Object3D {
    constructor(geometry?: BufferGeometry, material?: PointsMaterial);
    geometry: BufferGeometry;
    material: PointsMaterial;
  }
  
  export class PointsMaterial extends Material {
    constructor(parameters?: { color?: Color | string | number; size?: number; sizeAttenuation?: boolean });
    color: Color;
    size: number;
    sizeAttenuation: boolean;
  }
}

declare module '@react-three/fiber' {
  import { ReactNode } from 'react';
  import * as THREE from 'three';
  
  export function Canvas(props: {
    children: ReactNode;
    camera?: { position?: [number, number, number]; fov?: number; near?: number; far?: number };
    style?: React.CSSProperties;
    gl?: any;
    shadows?: boolean;
    orthographic?: boolean;
  }): JSX.Element;
  
  export function useFrame(callback: (state: any, delta: number) => void, priority?: number): void;
  
  export function useThree(): {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    size: { width: number; height: number };
    viewport: { width: number; height: number };
    gl: THREE.WebGLRenderer;
  };
  
  export function extend(objects: Record<string, any>): void;
}

declare module '@react-three/drei' {
  import { ReactNode } from 'react';
  import * as THREE from 'three';
  
  export function OrbitControls(props?: {
    enabled?: boolean;
    target?: [number, number, number];
    enableDamping?: boolean;
    dampingFactor?: number;
    enableZoom?: boolean;
    enableRotate?: boolean;
    enablePan?: boolean;
    maxDistance?: number;
    minDistance?: number;
  }): JSX.Element;
  
  export function useTexture(path: string | string[]): THREE.Texture | THREE.Texture[];
  
  export function Text(props: {
    children: ReactNode;
    color?: string;
    fontSize?: number;
    position?: [number, number, number];
    anchorX?: 'left' | 'center' | 'right';
    anchorY?: 'top' | 'middle' | 'bottom';
  }): JSX.Element;
}

// 解决antd相关库的类型声明
declare module 'antd' {
  import { ReactNode } from 'react';
  
  export const Layout: any;
  export const Menu: any;
  export const Button: any;
  export const Form: any;
  export const Input: any;
  export const Select: any;
  export const Table: any;
  export const Tabs: any;
  export const Modal: any;
  export const Spin: any;
  export const Card: any;
  export const Tooltip: any;
  export const message: any;
  export const notification: any;
  export const DatePicker: any;
  export const TimePicker: any;
  export const Checkbox: any;
  export const Radio: any;
  export const Switch: any;
  export const Slider: any;
  export const Upload: any;
  export const Progress: any;
  export const Popover: any;
  export const Popconfirm: any;
  export const Drawer: any;
  export const Dropdown: any;
  export const List: any;
  export const Avatar: any;
  export const Badge: any;
  export const Tag: any;
  export const Divider: any;
  export const Row: any;
  export const Col: any;
  export const Space: any;
  export const Steps: any;
  export const Collapse: any;
  export const Carousel: any;
  export const Alert: any;
  export const Result: any;
  export const Skeleton: any;
  export const ConfigProvider: any;
  export const Typography: any;
  export const Calendar: any;
  export const Timeline: any;
  export const Mentions: any;
  export const Rate: any;
  export const Empty: any;
  export const PageHeader: any;
  export const Statistic: any;
  export const Tree: any;
  export const TreeSelect: any;
  export const Affix: any;
  export const Anchor: any;
  export const BackTop: any;
  export const Breadcrumb: any;
  export const Cascader: any;
  export const Comment: any;
  export const Descriptions: any;
}

declare module '@ant-design/icons' {
  import { ReactNode } from 'react';
  
  export const UserOutlined: any;
  export const LockOutlined: any;
  export const MailOutlined: any;
  export const HomeOutlined: any;
  export const SettingOutlined: any;
  export const MenuOutlined: any;
  export const CloseOutlined: any;
  export const SearchOutlined: any;
  export const PlusOutlined: any;
  export const EditOutlined: any;
  export const DeleteOutlined: any;
  export const SaveOutlined: any;
  export const UploadOutlined: any;
  export const DownloadOutlined: any;
  export const EyeOutlined: any;
  export const EyeInvisibleOutlined: any;
  export const CheckOutlined: any;
  export const CloseCircleOutlined: any;
  export const InfoCircleOutlined: any;
  export const WarningOutlined: any;
  export const QuestionCircleOutlined: any;
  export const ArrowLeftOutlined: any;
  export const ArrowRightOutlined: any;
  export const ArrowUpOutlined: any;
  export const ArrowDownOutlined: any;
}

// 添加axios类型声明
declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request: any;
  }

  export interface AxiosError<T = any> extends Error {
    config: any;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
  }

  export interface AxiosInstance {
    (config: any): Promise<AxiosResponse>;
    (url: string, config?: any): Promise<AxiosResponse>;
    defaults: any;
    get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
    head<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
    options<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
  }

  export interface AxiosStatic extends AxiosInstance {
    create(config?: any): AxiosInstance;
    defaults: any;
    interceptors: {
      request: any;
      response: any;
    };
  }

  const axios: AxiosStatic;
  export default axios;
}

// 向JSX命名空间添加元素声明
declare namespace JSX {
  interface IntrinsicElements {
    div: any;
    span: any;
    p: any;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    a: any;
    button: any;
    input: any;
    select: any;
    option: any;
    form: any;
    label: any;
    img: any;
    table: any;
    tr: any;
    td: any;
    th: any;
    thead: any;
    tbody: any;
    ul: any;
    li: any;
    header: any;
    footer: any;
    nav: any;
    main: any;
    section: any;
    article: any;
    aside: any;
    canvas: any;
    svg: any;
    path: any;
    circle: any;
    rect: any;
    line: any;
    polyline: any;
    polygon: any;
    text: any;
    g: any;
    defs: any;
    clipPath: any;
    mask: any;
    linearGradient: any;
    radialGradient: any;
    stop: any;
    tspan: any;
    textPath: any;
    pattern: any;
    // Three.js 特定元素
    mesh: any;
    pointLight: any;
    ambientLight: any;
    directionalLight: any;
    spotLight: any;
    hemisphereLight: any;
    group: any;
    plane: any;
    box: any;
    sphere: any;
    cylinder: any;
    cone: any;
    points: any;
    line: any;
    lineSegments: any;
    gridHelper: any;
    axesHelper: any;
    sprite: any;
    primitive: any;
  }
}
