export const timeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diff = now - postDate; // 시간 차이 (밀리초 기준)

  const seconds = Math.floor(diff / 1000); // 초
  const minutes = Math.floor(seconds / 60); // 분
  const hours = Math.floor(minutes / 60); // 시간
  const days = Math.floor(hours / 24); // 일

  if (seconds < 60) return `${seconds}초 전`;
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};
