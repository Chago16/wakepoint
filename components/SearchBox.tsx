import { searchLocations } from '@/utils/geocodingService';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from './ThemedText';

type LocationResult = {
  id: string;
  name: string;
  coords: [number, number];
};

type SearchBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (location: LocationResult) => void;
  placeholder?: string;
};

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChangeText,
  onSelect,
  placeholder = 'Search for a location',
}) => {
  const [results, setResults] = useState<LocationResult[]>([]);
  const searchCache = useRef<Record<string, LocationResult[]>>({});
  const userInputRef = useRef(false); // ✅ Track if input is user-typed

  const fetchResults = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    if (searchCache.current[query]) {
      setResults(searchCache.current[query]);
      return;
    }

    const data = await searchLocations(query);
    const cleaned = data
      .filter(loc => Array.isArray(loc.coords) && loc.coords.length === 2)
      .map(loc => ({
        id: loc.id,
        name: loc.name,
        coords: [loc.coords[0], loc.coords[1]],
      }));

    searchCache.current[query] = cleaned;
    setResults(cleaned);

    if (__DEV__) {
      console.log('🔍 SearchBox: API results', cleaned);
    }
  }, []);

  const debouncedFetch = useMemo(() => debounce(fetchResults, 1000), [fetchResults]);

  useEffect(() => {
    if (userInputRef.current && value.length >= 3) {
      debouncedFetch(value);
    } else {
      setResults([]);
    }

    return () => {
      debouncedFetch.cancel();
    };
  }, [value, debouncedFetch]);

  const handleChangeText = (text: string) => {
    userInputRef.current = true; // ✅ Mark as user input
    onChangeText(text);
  };

  const handleSelect = (item: LocationResult) => {
    userInputRef.current = false; // ✅ Prevent auto search after pin tap
    onChangeText(item.name);
    setResults([]);
    onSelect(item);

    if (__DEV__) {
      console.log('📍 Selected location:', item);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        style={styles.input}
      />
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              <ThemedText type="default">{item.name}</ThemedText>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  item: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});
