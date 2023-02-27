import { useEffect, useState } from 'react';

import { Box, Button, Divider, Grid, TextField, Typography } from '@material-ui/core';
import { renderCurrencyAmount } from './fn'

export interface CompanyCurrencySetting {
  isAbbreviationEnabled?: boolean;
  displayDecimal?: boolean;
  abbreviationDecimalPoints?: number;
  decimalSeparator?: string;
  thousandsSeparator?: string;
  millionsSeparator?: string;
  billionsSeparator?: string;
}

export interface CCCurrencySetting {
  isShowFullDigits: boolean;
  isRoundingUp: boolean;
  isAlwaysMinAbbreviation: boolean;
  isShowCurrencyCode: boolean;
}
const camelToNormal = (camelCase: string) => {
  // Replace all capital letters with spaces followed by the lowercase letter
  return camelCase.replace(/([A-Z])/g, ' $1')
    // Capitalize the first letter and remove any leading/trailing spaces
    .replace(/^./, str => str.toUpperCase())
    .trim();
}


const App = () => {
  const [currencySetting, setCurrencySetting] = useState<CompanyCurrencySetting>({
    isAbbreviationEnabled: false,
    displayDecimal: false,
    abbreviationDecimalPoints: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    millionsSeparator: `'`,
    billionsSeparator: `"`,
  })

  const [ccSetting, setCCSetting] = useState<CCCurrencySetting>({
    isShowFullDigits: false,
    isRoundingUp: false,
    isAlwaysMinAbbreviation: false,
    isShowCurrencyCode: false,
  })

  const [inputAmounts, setInputAmounts] = useState<number[]>(Array(3).fill(0));

  const renderSrStatus = (isFlag: boolean, srkey: string) => {
    if (!isFlag) {
      return;
    }
    const booleanStatus = currencySetting[srkey as keyof CompanyCurrencySetting] as boolean;

    const doStatusChange = () => {
      setCurrencySetting((prev) => ({
        ...prev,
        [srkey as keyof CompanyCurrencySetting]: !booleanStatus,
      }))
    }

    return (
      <Grid item>
        <Button onClick={doStatusChange} style={renderBtnStyle(booleanStatus)}>
          <Typography>
            {booleanStatus ? 'Enabled' : 'Disabled'}
          </Typography>
        </Button>
      </Grid>
    )
  }

  const renderSrStringStatus = (isStringFlag: boolean, srkey: string) => {
    if (!isStringFlag) return;

    const stringValue = currencySetting[srkey as keyof CompanyCurrencySetting] as string;

    const isNumber = srkey === 'abbreviationDecimalPoints' ? 'number' : undefined;

    const doStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrencySetting((prev) => ({
        ...prev,
        [srkey as keyof CompanyCurrencySetting]: e.target.value,
      }))
    }

    return (
      <Grid item>
        <TextField label="value" variant="standard" size="small" type={isNumber} value={stringValue}
          onChange={doStringChange}
        >
          {stringValue}
        </TextField>
      </Grid>
    )
  }

  const renderCcStatus = (cckey: string) => {
    const booleanStatus = ccSetting[cckey as keyof CCCurrencySetting] as boolean;

    const doStatusChange = () => {
      setCCSetting((prev) => ({
        ...prev,
        [cckey as keyof CCCurrencySetting]: !booleanStatus,
      }))
    }

    return (
      <Grid item>
        <Button onClick={doStatusChange} style={renderBtnStyle(booleanStatus)}>
          <Typography>
            {booleanStatus ? 'Enabled' : 'Disabled'}
          </Typography>
        </Button>
      </Grid>
    )
  }

  const renderInputAmount = (_inputAmount: number, idx: number) => {

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const updated = inputAmounts.map((inputMap, mapIDX) => {
        if (mapIDX === idx) {
          return Number(e.target.value)
        }
        return inputMap;
      })
      setInputAmounts(updated)
    }

    return (
      <>
        <TextField
          label='input'
          variant='standard'
          size='small'
          type='number'
          value={inputAmounts?.[idx]}
          onChange={handleInput}
        />
        <TextField
          label='output'
          inputProps={{
            style: { textAlign: 'right' }
          }}
          value={renderCurrencyAmount(
            inputAmounts?.[idx] ?? 0,
            'MYR',
            currencySetting,
            ccSetting
          )}
        />
      </>
    )
  }


  return (
    <Box style={containerClass}>
      <Grid
        container
        spacing={1}
        direction="column"
        justifyContent='center'
        style={{ width: 600 }}
      >
        {Object.keys(currencySetting)?.map((srSetting, idx) => (
          <Grid key={idx} item container justifyContent='space-between' alignItems='center'>
            <Grid item>
              <Box mr={1}>
                <Typography>{camelToNormal(srSetting)}</Typography>
              </Box>
            </Grid>
            {renderSrStatus(
              (srSetting === 'isAbbreviationEnabled' || srSetting === 'displayDecimal'),
              srSetting,
            )}
            {renderSrStringStatus(
              !(srSetting === 'isAbbreviationEnabled' || srSetting === 'displayDecimal'),
              srSetting,
            )}
          </Grid>
        ))}
        {Object.keys(ccSetting)?.map((ccSetting, idx) => (
          <Grid key={idx} item container justifyContent='space-between' alignItems='center'>
            <Grid item>
              <Box mr={1}>
                <Typography>{camelToNormal(ccSetting)}</Typography>
              </Box>
            </Grid>
            {renderCcStatus(
              ccSetting,
            )}
          </Grid>
        ))}
      </Grid>
      <Box style={{ margin: '14px 0' }}>
        <Divider />
      </Box>
      <Box style={{ marginTop: '20px' }}>
        <Grid
          container
          spacing={1}
          direction="column"
          justifyContent='center'
          style={{ width: 500, }}
        >
          {inputAmounts?.map((inputAmount, idx) => (
            <Grid item key={idx} container direction='row' justifyContent='space-between'>
              {renderInputAmount(inputAmount, idx)}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default App;

const renderBtnStyle = (stat: boolean) => ({
  color: stat ? '#Cffce4' : 'black',
  backgroundColor: stat ? 'rgb(81, 191, 152)' : '#Ff581d',
  borderRadius: '4px',

})

const containerClass = {
  backgroundColor: '#ceeeee',
  height: '100vh',
  width: '100vw',
  padding: 15,
}
