import React from 'react';
import styled from 'styled-components';

const FlippingCard = ({ number, icon, title, detail, badge, footer }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="content">
          {/* Flipped side (now front): show only the detail, visually distinct */}
          <div className="front">
            <div className="flipped-detail">
              <span className="detail-text">{detail}</span>
            </div>
          </div>
          {/* Back side: show icon, number, title, badge, footer */}
          <div className="back">
            <div className="img">
              <div className="circle"></div>
              <div className="circle" id="right"></div>
              <div className="circle" id="bottom"></div>
            </div>
            <div className="back-content">
              {icon}
              {number && <span className="card-number">{number}</span>}
              {badge && <small className="badge">{badge}</small>}
              <div className="description">
                <div className="title">
                  <p className="title">
                    <strong>{title}</strong>
                  </p>
                </div>
                {footer && <p className="card-footer">{footer}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    overflow: visible;
    width: 190px;
    height: 254px;
    position: relative;
  }

  .content {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 300ms;
    box-shadow: 0px 0px 10px 1px #000000ee;
    border-radius: 5px;
    position: relative;
  }

  .front, .back {
    background-color: #151515;
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 5px;
    overflow: hidden;
    top: 0;
    left: 0;
  }

  .front {
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    /* visually distinct for detail */
    background: linear-gradient(135deg, #232526 0%, #414345 100%);
  }

  .flipped-detail {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .detail-text {
    font-size: 1.15rem;
    font-weight: 600;
    color: #fff;
    text-align: center;
    line-height: 1.5;
    letter-spacing: 0.01em;
  }

  .back {
    width: 100%;
    height: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
    overflow: hidden;
    z-index: 2;
    /* keep animated border */
  }

  .back::before {
    position: absolute;
    content: ' ';
    display: block;
    width: 160px;
    height: 160%;
    /* Blue/cyan/indigo gradient for theme glow */
    background: linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #6366f1, #3b82f6, transparent);
    animation: rotation_481 5000ms infinite linear;
  }

  .back-content {
    position: absolute;
    width: 99%;
    height: 99%;
    background-color: #151515;
    border-radius: 5px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 18px;
    z-index: 3;
    padding: 1rem;
    text-align: center;
  }

  .card-number {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffbb66;
    margin-bottom: 0.5rem;
  }

  .card:hover .content {
    transform: rotateY(180deg);
  }

  @keyframes rotation_481 {
    0% {
      transform: rotateZ(0deg);
    }
    100% {
      transform: rotateZ(360deg);
    }
  }

  .img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .circle {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-color: #ffbb66;
    position: relative;
    filter: blur(15px);
    animation: floating 2600ms infinite linear;
  }

  #bottom {
    background-color: #ff8866;
    left: 50px;
    top: 0px;
    width: 150px;
    height: 150px;
    animation-delay: -800ms;
  }

  #right {
    background-color: #ff2233;
    left: 160px;
    top: -80px;
    width: 30px;
    height: 30px;
    animation-delay: -1800ms;
  }

  @keyframes floating {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .badge {
    background-color: #00000055;
    padding: 2px 10px;
    border-radius: 10px;
    backdrop-filter: blur(2px);
    width: fit-content;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }

  .description {
    box-shadow: 0px 0px 10px 5px #00000088;
    width: 100%;
    padding: 10px;
    background-color: #00000099;
    backdrop-filter: blur(5px);
    border-radius: 5px;
  }

  .title {
    font-size: 1rem;
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .title p {
    width: 100%;
  }

  .card-footer {
    color: #ffffff88;
    margin-top: 5px;
    font-size: 0.85rem;
  }

`;

export default FlippingCard; 