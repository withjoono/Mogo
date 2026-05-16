export const useGetCurrentUser = () => {
    return {
      data: { id: "1", nickname: "학생" },
      isLoading: false,
      error: null,
    };
  };

export const useGetActiveServices = () => {
    return { data: ["S", "J"] };
};
