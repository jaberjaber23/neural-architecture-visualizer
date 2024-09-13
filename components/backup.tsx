"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Input, VStack, HStack, Heading, SimpleGrid, Divider, Button, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

type Matrix = number[][];

interface Hyperparameters {
  modelDimension: number;
  numHeads: number;
  dropoutRate: number;
  maxSeqLength: number;
}

const SelfAttentionVisualization: React.FC = () => {
  const [inputText, setInputText] = useState<string>('The quick brown fox');
  const [tokens, setTokens] = useState<string[]>([]);
  const [Q, setQ] = useState<Matrix>([]);
  const [K, setK] = useState<Matrix>([]);
  const [V, setV] = useState<Matrix>([]);
  const [QKt, setQKt] = useState<Matrix>([]);
  const [scaledQKt, setScaledQKt] = useState<Matrix>([]);
  const [attentionScores, setAttentionScores] = useState<Matrix>([]);
  const [output, setOutput] = useState<Matrix>([]);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [hyperparams, setHyperparams] = useState<Hyperparameters>({
    modelDimension: 512,
    numHeads: 8,
    dropoutRate: 0.1,
    maxSeqLength: 512,
  });

  const tokenRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    handleInputChange(inputText);
  }, [hyperparams]);

  const handleInputChange = (text: string) => {
    const newTokens = text.split(' ').slice(0, hyperparams.maxSeqLength);
    setTokens(newTokens);
    setInputText(newTokens.join(' '));
    calculateAttention(newTokens);
    setSelectedWord(null);
  };

  const calculateAttention = (tokens: string[]) => {
    if (tokens.length === 0) {
      setQ([]);
      setK([]);
      setV([]);
      setQKt([]);
      setScaledQKt([]);
      setAttentionScores([]);
      setOutput([]);
      return;
    }

    const dim = hyperparams.modelDimension;
    const headDim = dim / hyperparams.numHeads;
    
    const newQ = generateRandomMatrix(tokens.length, dim);
    const newK = generateRandomMatrix(tokens.length, dim);
    const newV = generateRandomMatrix(tokens.length, dim);
    
    setQ(newQ);
    setK(newK);
    setV(newV);

    const newQKt = matrixMultiply(newQ, transposeMatrix(newK));
    setQKt(newQKt);

    const newScaledQKt = scaleMatrix(newQKt, 1 / Math.sqrt(headDim));
    setScaledQKt(newScaledQKt);

    const newAttentionScores = applySoftmax(newScaledQKt);
    setAttentionScores(applyDropout(newAttentionScores, hyperparams.dropoutRate));

    const newOutput = matrixMultiply(newAttentionScores, newV);
    setOutput(newOutput);
  };

  const generateRandomMatrix = (rows: number, cols: number): Matrix => {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => parseFloat((Math.random() - 0.5).toFixed(2)))
    );
  };

  const transposeMatrix = (matrix: Matrix): Matrix => {
    if (matrix.length === 0 || matrix[0].length === 0) return [];
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };

  const matrixMultiply = (a: Matrix, b: Matrix): Matrix => {
    if (a.length === 0 || b.length === 0 || a[0].length !== b.length) {
      console.error('Invalid matrix dimensions for multiplication');
      return [];
    }
    return a.map(row => 
      b[0].map((_, i) => 
        row.reduce((sum, _, j) => sum + (row[j] || 0) * (b[j]?.[i] || 0), 0)
      ).map(val => parseFloat(val.toFixed(2)))
    );
  };

  const scaleMatrix = (matrix: Matrix, scale: number): Matrix => {
    return matrix.map(row => row.map(val => parseFloat((val * scale).toFixed(2))));
  };

  const applySoftmax = (matrix: Matrix): Matrix => {
    return matrix.map(row => {
      const expRow = row.map(Math.exp);
      const sumExp = expRow.reduce((a, b) => a + b, 0);
      return expRow.map(exp => parseFloat((exp / sumExp).toFixed(2)));
    });
  };

  const applyDropout = (matrix: Matrix, rate: number): Matrix => {
    return matrix.map(row => 
      row.map(val => Math.random() > rate ? val : 0)
    );
  };

  const createArcPath = (startX: number, startY: number, endX: number, endY: number) => {
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - Math.abs(endX - startX) * 0.2;
    return `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`;
  };

  const renderMatrix = (matrix: Matrix, name: string) => {
    if (!matrix || matrix.length === 0 || !matrix[0]) {
      return <Text>Matrix {name} is empty</Text>;
    }
    return (
      <Box borderWidth={1} borderRadius="lg" p={4}>
        <Heading size="sm" mb={2}>{name}</Heading>
        <BlockMath math={`${name} = \\begin{bmatrix} 
          ${matrix.map(row => row.slice(0, 4).join(' & ')).join(' \\\\ ')}
          ${matrix[0].length > 4 ? '\\cdots' : ''}
        \\end{bmatrix}`} />
      </Box>
    );
  };

  const renderWordSpecificCalculations = (index: number) => {
    if (index < 0 || index >= tokens.length || !Q[index] || !K[index] || !V[index] || !attentionScores[index] || !output[index]) {
      return <Text>Invalid word selection</Text>;
    }
    return (
      <VStack spacing={4} align="stretch">
        <Heading size="md">Calculations for "{tokens[index]}"</Heading>
        <Text>Query vector (first 4 dimensions):</Text>
        <InlineMath math={`q = [${Q[index].slice(0, 4).join(', ')}, \\ldots]`} />
        <Text>Key vector (first 4 dimensions):</Text>
        <InlineMath math={`k = [${K[index].slice(0, 4).join(', ')}, \\ldots]`} />
        <Text>Value vector (first 4 dimensions):</Text>
        <InlineMath math={`v = [${V[index].slice(0, 4).join(', ')}, \\ldots]`} />
        <Text>Attention scores:</Text>
        <InlineMath math={`\\text{scores} = [${attentionScores[index].join(', ')}]`} />
        <Text>Output (first 4 dimensions):</Text>
        <InlineMath math={`\\text{output} = [${output[index].slice(0, 4).join(', ')}, \\ldots]`} />
      </VStack>
    );
  };

  const HyperparameterControl: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
  }> = ({ label, value, onChange, min, max, step }) => (
    <Box>
      <Text>{label}</Text>
      <HStack>
        <NumberInput 
          value={value} 
          onChange={(_, val) => onChange(val)}
          min={min} 
          max={max} 
          step={step}
          width="100px"

        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Slider 
          value={value} 
          onChange={onChange}
          min={min} 
          max={max} 
          step={step}
          flex="1"
        >
        <SliderTrack>
        <SliderFilledTrack bg="black" />
        </SliderTrack>
        <SliderThumb bg="black" />
        </Slider>
      </HStack>
    </Box>
  );

  return (
    <VStack spacing={6} align="stretch" m={4}>
      <Heading size="lg">Self-Attention Mechanism Visualization</Heading>
      <Input
        value={inputText}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Enter text for self-attention visualization"
        mb={4}
      />
      <Box borderWidth={1} borderRadius="lg" p={4}>
        <Heading size="md" mb={4}>Hyperparameters</Heading>
        <SimpleGrid columns={2} spacing={4}>
          <HyperparameterControl
            label="Model Dimension"
            value={hyperparams.modelDimension}
            onChange={(val) => setHyperparams({...hyperparams, modelDimension: val})}
            min={64}
            max={1024}
            step={64}
          />
          <HyperparameterControl
            label="Number of Heads"
            value={hyperparams.numHeads}
            onChange={(val) => setHyperparams({...hyperparams, numHeads: val})}
            min={1}
            max={16}
            step={1}
          />
          <HyperparameterControl
            label="Dropout Rate"
            value={hyperparams.dropoutRate}
            onChange={(val) => setHyperparams({...hyperparams, dropoutRate: val})}
            min={0}
            max={0.5}
            step={0.05}
          />
          <HyperparameterControl
            label="Max Sequence Length"
            value={hyperparams.maxSeqLength}
            onChange={(val) => setHyperparams({...hyperparams, maxSeqLength: val})}
            min={16}
            max={1024}
            step={16}
          />
        </SimpleGrid>
      </Box>
      <Box borderWidth={1} borderRadius="lg" p={4} position="relative" height="200px">
        <Heading size="md" mb={4}>Attention Visualization</Heading>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          {selectedWord !== null && attentionScores[selectedWord] && 
            tokens.map((_, i) => {
              if (i === selectedWord) return null;
              const startButton = tokenRefs.current[selectedWord];
              const endButton = tokenRefs.current[i];
              if (!startButton || !endButton) return null;
              const startRect = startButton.getBoundingClientRect();
              const endRect = endButton.getBoundingClientRect();
              const score = attentionScores[selectedWord][i];
              const parentRect = startButton.offsetParent?.getBoundingClientRect();
              const startX = startRect.left + startRect.width / 2 - (parentRect?.left || 0);
              const startY = startRect.top - (parentRect?.top || 0);
              const endX = endRect.left + endRect.width / 2 - (parentRect?.left || 0);
              const endY = endRect.top - (parentRect?.top || 0);
              return (
                <g key={`${selectedWord}-${i}`}>
                  <motion.path
                    d={createArcPath(startX, startY, endX, endY)}
                    stroke="black"
                    strokeWidth={2}
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.path
                    d={createArcPath(startX, startY, endX, endY)}
                    stroke="rgba(0, 0, 0, 0.2)"
                    strokeWidth={score * 20}
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </g>
              );
            })
          }
        </svg>
        <HStack spacing={4} justifyContent="center" overflowX="auto" pb={2}>
        {tokens.map((token, i) => (
          <Button
            key={i}
            ref={(el: HTMLButtonElement | null) => tokenRefs.current[i] = el}
            onClick={() => setSelectedWord(i)}
            bg={selectedWord === i ? 'black' : 'gray.200'}
            color={selectedWord === i ? 'white' : 'black'}
            _hover={{
              bg: selectedWord === i ? 'gray.800' : 'gray.300'
            }}
          >
            {token}
          </Button>
        ))}
      </HStack>
      </Box>
      {selectedWord !== null && renderWordSpecificCalculations(selectedWord)}
      <Divider />
      <Heading size="md">Step-by-Step Calculation</Heading>
      <SimpleGrid columns={3} spacing={4}>
        {renderMatrix(Q, 'Q')}
        {renderMatrix(K, 'K')}
        {renderMatrix(V, 'V')}
      </SimpleGrid>
      <Divider />
      <Heading size="md">Step 1: Calculate QK^T</Heading>
      <BlockMath math={`QK^T = Q \\cdot K^T`} />
      {renderMatrix(QKt, 'QK^T')}
      <Divider />
      <Heading size="md">Step 2: Scale QK^T</Heading>
      <BlockMath math={`\\text{Scaled } QK^T = \\frac{QK^T}{\\sqrt{d_k}}`} />
  

{renderMatrix(scaledQKt, 'Scaled QK^T')}
      <Divider />
      <Heading size="md">Step 3: Apply Softmax</Heading>
      <BlockMath math={`\\text{Attention Scores} = \\text{softmax}(\\text{Scaled } QK^T)`} />
      {renderMatrix(attentionScores, 'Attention Scores')}
      <Divider />
      <Heading size="md">Step 4: Multiply with V</Heading>
      <BlockMath math={`\\text{Output} = \\text{Attention Scores} \\cdot V`} />
      {renderMatrix(output, 'Output')}
    </VStack>
  );
};

export default SelfAttentionVisualization;