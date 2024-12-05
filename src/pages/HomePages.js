import React from 'react';
import styled from 'styled-components';

const ContainerImage = styled.div`
  width: 100%;
  height: 70vh;
  background-image: url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
  background-size: cover;
  background-position: center;
  position: relative;

  @media (max-width: 768px) {
    height: 50vh;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(242, 230, 207, 0.3);
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  top: 50%;
  left: 10%;
  transform: translateY(-60%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 50%;

  @media (max-width: 768px) {
    width: 80%;
    left: 5%;
  }
`;

const Title = styled.h2`
  color: white;
  font-size: 3rem;
  margin-bottom: -1rem;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-top: 2rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Button = styled.button`
  background-color: #114C5F;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: #1a6985;
    transform: scale(1.05);
  }

  @media (min-width: 769px) {
    margin-left: 0;
    max-width: 200px;
    width: 100%;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    margin-right: 1rem;
    width: auto;
  }
`;

export { Button, Title, ContentWrapper, ContainerImage, ButtonWrapper, Overlay };