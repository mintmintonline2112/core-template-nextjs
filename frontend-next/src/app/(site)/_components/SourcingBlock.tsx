"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_SOURCING_SLIDES,
  SourcingSlider,
  type SourcingSlide,
} from "./SourcingSlider";

export type ChainStep = { title: string; text?: string };

/**
 * Slider sourcing + chuỗi bước bấm được.
 * Bấm ô số N → slider nhảy tới ảnh thứ N; slider tự chạy → ô tương ứng sáng lên.
 * Nếu số ảnh ít hơn số bước thì các bước dư dùng ảnh cuối cùng.
 */
export function SourcingBlock({
  slides,
  chain,
}: {
  slides?: SourcingSlide[];
  chain: ChainStep[];
}) {
  // undefined = chưa cấu hình → dùng bộ ảnh mặc định; mảng rỗng = cố ý không có slider.
  const list = slides ?? DEFAULT_SOURCING_SLIDES;
  const [current, setCurrent] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [chainHover, setChainHover] = useState(false);

  // Slider tự đổi ảnh (autoplay / mũi tên / chấm) → ô bước tương ứng sáng theo.
  const handleSlideChange = useCallback((index: number) => {
    setCurrent(index);
    setActiveStep(index);
  }, []);

  const selectStep = (step: number) => {
    setActiveStep(step);
    setCurrent(Math.min(step, Math.max(0, list.length - 1)));
  };

  return (
    <>
      {list.length > 0 ? (
        <SourcingSlider
          slides={list}
          current={current}
          onChange={handleSlideChange}
          paused={chainHover}
        />
      ) : null}

      {chain.length > 0 ? (
        <div
          className="chain reveal"
          style={{ ["--chain-cols" as string]: chain.length } as React.CSSProperties}
          onMouseEnter={() => setChainHover(true)}
          onMouseLeave={() => setChainHover(false)}
        >
          {chain.map((step, index) => (
            <button
              key={step.title}
              type="button"
              className={
                index === activeStep ? "chain-step chain-step-active" : "chain-step"
              }
              aria-current={index === activeStep ? "true" : undefined}
              aria-controls={list.length > 0 ? "sourcing-slider" : undefined}
              onClick={() => selectStep(index)}
            >
              <span className="chain-num">{index + 1}</span>
              <h3>{step.title}</h3>
              {step.text ? <p>{step.text}</p> : null}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
