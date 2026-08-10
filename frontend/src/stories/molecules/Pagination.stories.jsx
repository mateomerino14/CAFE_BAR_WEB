import {useState} from 'react';
import {Pagination} from '../../components/molecules/Pagination';

export default {
  title: 'Molecules/Pagination',
  component: Pagination,
  tags: ['autodocs']
};

export const Interactive = {
  render: () => {
    const totalPages = 5;
    const [currentPage, setCurrentPage] = useState(2);
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        canGoLeft={currentPage > 1}
        canGoRight={currentPage < totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
    );
  }
};

export const FirstPage = {
  args: {
    currentPage: 1,
    totalPages: 4,
    canGoLeft: false,
    canGoRight: true
  }
};

export const LastPage = {
  args: {
    currentPage: 4,
    totalPages: 4,
    canGoLeft: true,
    canGoRight: false
  }
};

export const SinglePage = {
  args: {
    currentPage: 1,
    totalPages: 1,
    canGoLeft: false,
    canGoRight: false
  }
};