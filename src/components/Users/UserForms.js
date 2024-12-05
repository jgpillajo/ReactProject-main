import styled from 'styled-components';

// Componentes estilizados
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%);
`;

const FormContainer = styled.div`
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #f06292;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const StyledField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 5px;
  border: 1px solid ${props => props.error ? 'red' : '#ddd'};
  border-radius: 4px;
`;

const StyledErrorMessage = styled.div`
  color: red;
  font-size: 12px;
  margin-bottom: 10px;
  height: 15px; // Fixed height to prevent layout shifts
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #f06292;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #ddd;
  }
`;

const FileInputContainer = styled.div`
  margin-bottom: 15px;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 10px 15px;
  background-color: #f06292;
  color: white;
  border-radius: 4px;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileName = styled.span`
  margin-left: 10px;
`;

const ImagePreviewContainer = styled.div`
  margin-bottom: 15px;
`;

const ImagePreview = styled.img`
  max-width: 300px;
  max-height: 300px;
  width: auto;
  height: auto;
  border-radius: 4px;
  align-content: center;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
`;
export {
    PageContainer,
    FormContainer,
    Logo,
    Title,
    StyledField,
    StyledErrorMessage,
    SubmitButton,
    FileInputContainer,
    FileInputLabel,
    HiddenFileInput,
    FileName,
    ImagePreviewContainer,
    ImagePreview,
    FormGrid,
    FullWidthField
}