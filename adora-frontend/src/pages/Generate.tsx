import Title from "../components/Title";

const Generate = () => {
  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form className="mx-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Context Image"
          description="Upload your modal and product image to generate stunning UGC, short-form videos and social media post"
        />
        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
          {/* left col */}
          <div className="">
            <p>Product Image</p>
            <p>Model Image</p>
          </div>

          {/* right col */}
          <div>
            <p>Right</p>
          </div>
        </div>
      </form>
      <div></div>
    </div>
  );
};

export default Generate;
