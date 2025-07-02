function moveToSectionCards() {
  document
    .getElementById("sectionCards")
    ?.scrollIntoView({ behavior: "smooth" });
}

const BtnGoToSectionCards = () => {
  return (
    <button
      onClick={moveToSectionCards}
      aria-label="Saber más"
      className="flex col-span-2 text-white place-self-center bg-teal-700 rounded-full lg:rounded-none lg:bg-transparent lg:text-teal-700 w-fit lg:w-full place-content-center hover:bg-teal-600 px-6 lg:px-0 py-2 lg:py-3 hover:text-white transition-colors duration-300 hover:cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        className="hidden lg:block xl:scale-150 2xl:scale-175"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z"></path>
      </svg>
      <span className="lg:hidden">Saber más</span>
    </button>
  );
};

export default BtnGoToSectionCards;
