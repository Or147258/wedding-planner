import { FaWhatsapp } from 'react-icons/fa';
import {
  LuCheck,
  LuDownload,
  LuPencil,
  LuPlus,
  LuSearch,
  LuTrash2,
  LuX,
} from 'react-icons/lu';

// עוטף את אייקוני react-icons כך שאפשר להעביר width / height (ברירת מחדל 18)
const wrap = (Icon) =>
  function WrappedIcon({ width, height, ...props }) {
    return <Icon size={width ?? height ?? 18} aria-hidden="true" {...props} />;
  };

export const PlusIcon = wrap(LuPlus);
export const TrashIcon = wrap(LuTrash2);
export const PencilIcon = wrap(LuPencil);
export const DownloadIcon = wrap(LuDownload);
export const CloseIcon = wrap(LuX);
export const CheckIcon = wrap(LuCheck);
export const SearchIcon = wrap(LuSearch);
export const WhatsAppIcon = wrap(FaWhatsapp);
