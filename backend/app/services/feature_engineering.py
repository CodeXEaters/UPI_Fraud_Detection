def process_features(data):
    amount = data["amount"]

    high_amount = 1 if amount > 10000 else 0

    return [amount, high_amount]