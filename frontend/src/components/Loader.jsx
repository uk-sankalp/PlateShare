import React from 'react';
import styled from 'styled-components';

const Loader = ({ size = '36px', borderSize = '4px', color = 'rgba(0, 0, 0, .1)', pulseColor = 'transparent' }) => {
  return (
    <StyledWrapper size={size} borderSize={borderSize} color={color} pulseColor={pulseColor}>
      <div className="loader" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .loader {
    border: ${props => props.borderSize} solid ${props => props.color};
    border-left-color: ${props => props.pulseColor};
    border-radius: 50%;
    width: ${props => props.size};
    height: ${props => props.size};
    animation: spin89345 1s linear infinite;
  }

  @keyframes spin89345 {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }`;

export default Loader;
