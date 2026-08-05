import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getSections } from '../services/sectionService';

export const useSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managingSection, setManagingSection] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [success, setSuccess] = useState('');
  useAutoDismiss(success, () => setSuccess(''));
  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await getSections();
      setSections(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSections();
  }, []);
  const openManage = (section) => setManagingSection(section);
  const closeManage = () => setManagingSection(null);
  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);
  const handleRegistered = () => {
    setSuccess('Se ha registrado con éxito');
    closeRegister();
    fetchSections();
  };
  const handleUpdated = () => {
    setSuccess('Se ha registrado con éxito la modificación');
    closeManage();
    fetchSections();
  };
  return {
    sections,
    loading,
    managingSection,
    openManage,
    closeManage,
    isRegisterOpen,
    openRegister,
    closeRegister,
    handleRegistered,
    handleUpdated,
    success
  };
};