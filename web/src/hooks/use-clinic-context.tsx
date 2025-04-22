import { createContext, useContext, useState, ReactNode } from 'react';

// 定義診所類型
export interface Clinic {
  id: string;
  name: string;
  // 其他診所屬性
}

// 定義上下文類型
interface ClinicContextType {
  currentClinic: Clinic | null;
  setCurrentClinic: (clinic: Clinic | null) => void;
  clinics: Clinic[];
  loading: boolean;
}

// 建立上下文
const ClinicContext = createContext<ClinicContextType>({
  currentClinic: null,
  setCurrentClinic: () => {},
  clinics: [],
  loading: false
});

// 上下文提供者元件
export const ClinicProvider = ({ children }: { children: ReactNode }) => {
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 這裡可以添加從API獲取診所列表的邏輯

  return (
    <ClinicContext.Provider value={{ currentClinic, setCurrentClinic, clinics, loading }}>
      {children}
    </ClinicContext.Provider>
  );
};

// 自定義Hook，用於獲取診所上下文
export const useClinicContext = () => useContext(ClinicContext);