import React, { useState } from "react";
import { FiSend, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

const NewsletterBanner = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const existing = JSON.parse(
        localStorage.getItem("newsletterEmails") || "[]"
      );

      if (existing.includes(email)) {
        toast("You're already subscribed!", {
          icon: "✅",
        });
      } else {
        existing.push(email);

        localStorage.setItem(
          "newsletterEmails",
          JSON.stringify(existing)
        );

        toast.success("Subscribed successfully! 🎉", {
          style: {
            background: "#ff6b00",
            color: "#fff",
          },
        });
      }

      setEmail("");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full px-4 md:px-6 lg:px-8 py-10">
      <div
        className="
          relative
          max-w-[1400px]
          mx-auto
          rounded-[28px]
          overflow-hidden
          border border-[#eee5df]
          bg-[#f8f2ec]
          min-h-[170px]
        "
      >
        {/* Background glow */}
        <div className="absolute top-[-80px] left-[20%] w-[320px] h-[320px] bg-orange-100 blur-[120px] opacity-50 rounded-full"></div>

        {/* Main Content */}
        <div
          className="
            relative
            z-10
            grid
            grid-cols-1
            lg:grid-cols-[320px_1fr_220px]
            items-center
            gap-8
            px-6
            md:px-10
            py-8
          "
        >
          {/* LEFT */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="
                min-w-[62px]
                h-[62px]
                rounded-2xl
                border
                border-[#ff6b00]/20
                bg-white
                flex
                items-center
                justify-center
                shadow-sm
              "
            >
              <FiMail className="text-[30px] text-[#ff6b00]" />
            </div>

            {/* Text */}
            <div>
              <h2 className="text-[28px] font-bold text-[#1d1d1d] leading-tight">
                Join Our Community
              </h2>

              <p className="text-[15px] text-[#6b6b6b] mt-2 leading-7">
                Get 10% Off your first order and
                exclusive offers.
              </p>
            </div>
          </div>

          {/* CENTER */}
          <div>
            <form
              onSubmit={handleSubscribe}
              className="
                bg-white
                rounded-2xl
                p-2
                border border-[#ececec]
                shadow-sm
                flex
                flex-col
                sm:flex-row
                items-center
                gap-3
              "
            >
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="
                  flex-1
                  w-full
                  bg-transparent
                  px-5
                  py-4
                  text-[15px]
                  text-[#222]
                  outline-none
                  placeholder:text-[#999]
                "
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  h-[54px]
                  px-8
                  rounded-xl
                  bg-[#ff6b00]
                  hover:bg-[#ea6200]
                  text-white
                  font-semibold
                  text-[15px]
                  transition-all
                  duration-300
                  flex
                  items-center
                  gap-2
                  shadow-[0_10px_25px_rgba(255,107,0,0.25)]
                  whitespace-nowrap
                "
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}

                <FiSend className="text-[16px]" />
              </button>
            </form>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Decorative leaves */}
            <div className="absolute bottom-2 right-12 w-[120px] h-[60px] bg-orange-100 blur-2xl rounded-full opacity-60"></div>

            <img
              src="https://res.cloudinary.com/dbkpwluh0/image/upload/v1779185673/ChatGPT_Image_May_19_2026_03_44_00_PM_a892bh.png"
              alt="Tumbler"
              className="
                w-[120px]
                md:w-[140px]
                object-contain
                drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]
                hover:scale-[1.03]
                transition-all
                duration-500
                relative
                z-10
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBanner;