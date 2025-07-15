import { useState, useEffect, useRef } from "react";

const Disclaimer = (): JSX.Element | null => {
  const [modal, setModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleAccept = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setModal(false);
  };

  useEffect(() => {
    const accepted = localStorage.getItem("disclaimerAccepted");
    if (!accepted) {
      setModal(true);
    }
  }, []);

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={modalRef}
        className="relative w-[90%] max-w-[600px] max-h-[80vh] md:max-h-[50vh] overflow-y-auto bg-[#111114] border border-[#232429] rounded-lg"
      >
        <div className="flex justify-between items-center p-4 border-b border-[#232429]">
          <h2 className="text-[18px] leading-6 font-semibold text-white">
            Disclaimer Notice
          </h2>
        </div>
        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="text-[#A3A4A6] text-[18px] leading-6 font-medium flex flex-col gap-4">
            <p>
              Please read this disclaimer carefully before interacting with the
              protocol. <br />
              <br />
              By accessing or using this decentralized finance (DeFi) and yield
              farming protocol ("the Protocol"), you acknowledge and agree to
              the following terms:
            </p>
            <p className="flex flex-col gap-2">
              <span className="text-white text-[18px] leading-6 font-semibold">
                No Financial Advice
              </span>
              <span>
                The Protocol does not provide investment, financial, legal, or
                tax advice. All information and materials provided are for
                general informational purposes only. You should conduct your own
                research and consult with professional advisors before making
                any financial decisions.
              </span>
            </p>
            <p className="flex flex-col gap-2">
              <span className="text-white text-[18px] leading-6 font-semibold">
                User Responsibility
              </span>
              <span>
                You are solely responsible for evaluating and bearing the risks
                associated with the use of the Protocol. This includes but is
                not limited to risks of loss of funds, impermanent loss, smart
                contract vulnerabilities, liquidation, market volatility, and
                other technical or economic risks inherent to DeFi ecosystems.
              </span>
            </p>
            <p className="flex flex-col gap-2">
              <span className="text-white text-[18px] leading-6 font-semibold">
                No Guarantees or Warranties
              </span>
              <span>
                The Protocol is provided "as is" and "as available" without
                warranties of any kind, either expressed or implied. We do not
                guarantee the security, reliability, performance, or accuracy of
                the Protocol. Interacting with smart contracts carries risk, and
                you assume full responsibility for any outcomes.
              </span>
            </p>
            <p className="flex flex-col gap-2">
              <span className="text-white text-[18px] leading-6 font-semibold">
                Smart Contract Risk
              </span>
              <span>
                The Protocol relies on smart contracts deployed on public
                blockchains. These contracts are subject to potential bugs,
                exploits, or vulnerabilities. Even if contracts have been
                audited, there is no guarantee that they are completely free of
                defects. Use at your own risk.
              </span>
            </p>
            <p className="flex flex-col gap-2">
              <span className="text-white text-[18px] leading-6 font-semibold">
                Regulatory Uncertainty
              </span>
              <span>
                The regulatory status of DeFi protocols and tokens remains
                uncertain in many jurisdictions. It is your responsibility to
                ensure that your use of the Protocol is compliant with the laws
                and regulations applicable to you.
              </span>
            </p>
            <p className="flex flex-col gap-2">
              <span className="text-white text-[18px] leading-6 font-semibold">
                Limitation of Liability
              </span>
              <span>
                To the maximum extent permitted by law, the creators,
                developers, contributors, and affiliates of the Protocol shall
                not be held liable for any direct, indirect, incidental,
                special, consequential, or exemplary damages—including loss of
                funds, data, or profits—arising out of or in connection with
                your use of or inability to use the Protocol.
              </span>
            </p>
            <p className="flex flex-col gap-2">
              <span className="text-white text-[18px] leading-6 font-semibold">
                Use at Your Own Risk
              </span>
              <span>
                Use at Your Own Risk By using the Protocol, you acknowledge that
                you fully understand the risks involved and agree to assume full
                responsibility for any and all consequences, including potential
                loss of funds. You use this Protocol entirely at your own risk.
              </span>
            </p>
            <p>
              If you do not agree with any part of this disclaimer, do not use
              the Protocol.
            </p>
          </div>
          <button
            onClick={handleAccept}
            className="mt-4 bg-[#816FEA] text-white px-4 py-3 rounded-lg text-[14px] leading-5 font-semibold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export { Disclaimer };
