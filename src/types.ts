export type Config = {
  features: string[];
  paths: Record<string, string[]>;
  rootDir: string;
};

export type ImportInfo = {
  source: string;
  line: number;
};

export type Violation = {
  file: string;
  line: number;
  importPath: string;
  fromFeature: string;
  toFeature: string;
};

export type ScanResult = {
  violations: Violation[];
  filesChecked: number;
};
