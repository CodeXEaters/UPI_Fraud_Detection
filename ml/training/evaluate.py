from sklearn.metrics import classification_report

pred = model.predict(X_test)

print(classification_report(y_test, pred))